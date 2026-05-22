import type { Product } from "@/lib/product-data";
import type {
  PaymentMethod,
  Sale,
  SaleItem,
  SalePayment,
  SalePriceMode,
} from "@/lib/sale-data";

type CreateSaleInput = {
  sequence: number;
  customerId: string;
  cashSessionId: string;
  operator: string;
  notes: string;
  createdAt: string;
};

type AddSaleItemInput = {
  sale: Sale;
  product: Product;
  quantity: number;
  priceMode: SalePriceMode;
};

type AddPaymentInput = {
  sale: Sale;
  method: PaymentMethod;
  amount: number;
};

type FinishSaleInput = {
  sale: Sale;
  products: Product[];
  finishedAt: string;
};

export type FinishSaleResult =
  | {
      ok: true;
      sale: Sale;
      products: Product[];
    }
  | {
      ok: false;
      errors: string[];
    };

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getSaleSubtotal(items: SaleItem[]) {
  return roundMoney(items.reduce((total, item) => total + item.total, 0));
}

export function getPaidAmount(payments: SalePayment[]) {
  return roundMoney(
    payments.reduce((total, payment) => total + payment.amount, 0),
  );
}

export function getSaleBalance(sale: Sale) {
  return roundMoney(sale.total - getPaidAmount(sale.payments));
}

export function recalculateSale(sale: Sale): Sale {
  const subtotal = getSaleSubtotal(sale.items);
  const discount = Math.min(Math.max(sale.discount, 0), subtotal);
  const total = roundMoney(subtotal - discount);

  return {
    ...sale,
    subtotal,
    discount,
    total,
  };
}

export function createSale({
  sequence,
  customerId,
  cashSessionId,
  operator,
  notes,
  createdAt,
}: CreateSaleInput): Sale {
  return {
    id: `sale-${sequence}`,
    code: `VEN-${sequence}`,
    customerId,
    cashSessionId,
    operator,
    status: "open",
    createdAt,
    finishedAt: "",
    canceledAt: "",
    subtotal: 0,
    discount: 0,
    total: 0,
    payments: [],
    items: [],
    notes,
  };
}

export function getProductSalePrice(product: Product, mode: SalePriceMode) {
  return mode === "wholesale" ? product.wholesalePrice : product.salePrice;
}

export function createSaleItem({
  product,
  quantity,
  priceMode,
}: Omit<AddSaleItemInput, "sale">): SaleItem {
  const unitPrice = getProductSalePrice(product, priceMode);

  return {
    id: `sale-item-${Date.now()}`,
    productId: product.id,
    quantity,
    unitPrice,
    discount: 0,
    total: roundMoney(quantity * unitPrice),
  };
}

export function addSaleItem({
  sale,
  product,
  quantity,
  priceMode,
}: AddSaleItemInput): Sale {
  if (sale.status !== "open" || quantity <= 0) {
    return sale;
  }

  const unitPrice = getProductSalePrice(product, priceMode);
  const existingItem = sale.items.find(
    (item) => item.productId === product.id && item.unitPrice === unitPrice,
  );

  if (existingItem) {
    return recalculateSale({
      ...sale,
      items: sale.items.map((item) =>
        item.id === existingItem.id
          ? {
              ...item,
              quantity: roundMoney(item.quantity + quantity),
              total: roundMoney((item.quantity + quantity) * item.unitPrice),
            }
          : item,
      ),
    });
  }

  return recalculateSale({
    ...sale,
    items: [
      ...sale.items,
      createSaleItem({
        product,
        quantity,
        priceMode,
      }),
    ],
  });
}

export function removeSaleItem(sale: Sale, itemId: string): Sale {
  if (sale.status !== "open") {
    return sale;
  }

  return recalculateSale({
    ...sale,
    items: sale.items.filter((item) => item.id !== itemId),
  });
}

export function applySaleDiscount(sale: Sale, discount: number): Sale {
  if (sale.status !== "open") {
    return sale;
  }

  return recalculateSale({
    ...sale,
    discount,
  });
}

export function addSalePayment({
  sale,
  method,
  amount,
}: AddPaymentInput): Sale {
  if (sale.status !== "open" || amount <= 0) {
    return sale;
  }

  return {
    ...sale,
    payments: [
      ...sale.payments,
      {
        id: `payment-${Date.now()}`,
        method,
        amount: roundMoney(amount),
      },
    ],
  };
}

export function removeSalePayment(sale: Sale, paymentId: string): Sale {
  if (sale.status !== "open") {
    return sale;
  }

  return {
    ...sale,
    payments: sale.payments.filter((payment) => payment.id !== paymentId),
  };
}

export function validateSaleForFinish(sale: Sale, products: Product[]) {
  const errors: string[] = [];
  const productById = new Map(products.map((product) => [product.id, product]));

  if (sale.status !== "open") {
    errors.push("A venda precisa estar aberta.");
  }

  if (!sale.cashSessionId) {
    errors.push("Selecione uma sessao de caixa aberta.");
  }

  if (sale.items.length === 0) {
    errors.push("Adicione pelo menos um item.");
  }

  for (const item of sale.items) {
    const product = productById.get(item.productId);

    if (!product) {
      errors.push("Um dos produtos nao foi encontrado.");
      continue;
    }

    if (product.status !== "active") {
      errors.push(`${product.name} esta inativo.`);
    }

    if (product.currentStock < item.quantity) {
      errors.push(`${product.name} nao possui estoque suficiente.`);
    }
  }

  if (getPaidAmount(sale.payments) < sale.total) {
    errors.push("O total pago precisa cobrir o valor da venda.");
  }

  return errors;
}

export function finishSale({
  sale,
  products,
  finishedAt,
}: FinishSaleInput): FinishSaleResult {
  const recalculatedSale = recalculateSale(sale);
  const errors = validateSaleForFinish(recalculatedSale, products);

  if (errors.length > 0) {
    return {
      ok: false,
      errors,
    };
  }

  const productById = new Map(products.map((product) => [product.id, product]));
  const nextProducts = products.map((product) => {
    const soldQuantity = recalculatedSale.items
      .filter((item) => item.productId === product.id)
      .reduce((total, item) => total + item.quantity, 0);

    if (soldQuantity <= 0) {
      return product;
    }

    return {
      ...product,
      currentStock: Math.max(0, product.currentStock - soldQuantity),
    };
  });

  for (const item of recalculatedSale.items) {
    if (!productById.has(item.productId)) {
      return {
        ok: false,
        errors: ["Um dos produtos nao foi encontrado."],
      };
    }
  }

  return {
    ok: true,
    sale: {
      ...recalculatedSale,
      status: "finished",
      finishedAt,
    },
    products: nextProducts,
  };
}

export function cancelSale(sale: Sale, canceledAt: string): Sale {
  if (sale.status !== "open") {
    return sale;
  }

  return {
    ...sale,
    status: "canceled",
    canceledAt,
  };
}
