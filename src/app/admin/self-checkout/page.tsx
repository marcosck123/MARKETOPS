import { AdminShell } from "@/components/layout/admin-shell";
import { SelfCheckoutContent } from "@/components/self-checkout/self-checkout-content";

export default function SelfCheckoutPage() {
  return (
    <AdminShell>
      <SelfCheckoutContent />
    </AdminShell>
  );
}
