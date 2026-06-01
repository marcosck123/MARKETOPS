"use client";
import { useState, useEffect, useRef } from "react";
import { createFiscalRequest } from "@/lib/actions/fiscal-requests";
import { findCustomerByDocument } from "@/lib/actions/customers";

type Props = {
  open: boolean;
  saleId: string;
  saleCode: string;
  operatorId: string;
  onClose: () => void;
};

function applyDocMask(digits: string): string {
  const d = digits.slice(0, 14);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  if (d.length <= 11) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
  // CNPJ
  if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`;
  if (d.length <= 13) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12,14)}`;
}

export function NfModal({ open, saleId, saleCode, operatorId, onClose }: Props) {
  const [digits, setDigits] = useState("");
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setDigits(""); setCustomerName(null); setCustomerId(null);
      setError(""); setSent(false); setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  async function handleSearch() {
    if (digits.length !== 11 && digits.length !== 14) {
      setError("CPF (11 dígitos) ou CNPJ (14 dígitos) incompleto.");
      return;
    }
    setSearching(true); setError("");
    const customer = await findCustomerByDocument(digits);
    setSearching(false);
    if (customer) {
      const name = customer.name ?? customer.tradeName ?? null;
      setCustomerName(name);
      setCustomerId(customer.id);
    } else {
      setCustomerName(null); setCustomerId(null);
      setError("Cliente não cadastrado — a NF será emitida apenas com o documento.");
    }
  }

  async function handleRequest() {
    if (!digits) { setError("Informe o CPF ou CNPJ."); return; }
    setLoading(true); setError("");
    const result = await createFiscalRequest({
      saleId, saleCode, document: digits,
      customerId: customerId ?? undefined,
      customerName: customerName ?? undefined,
      operatorId,
    });
    setLoading(false);
    if (!result.success) { setError(result.error); return; }
    setSent(true);
  }

  if (!open) return null;

  const docValid = digits.length === 11 || digits.length === 14;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 70,
        background: "rgba(0,0,0,0.35)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div style={{
        width: "100%", maxWidth: 400,
        background: "#FFFFFF", borderRadius: 16,
        border: "1px solid #E4E2DC",
        boxShadow: "0 20px 60px rgba(0,0,0,0.14)",
        overflow: "hidden",
      }}>
        {sent ? (
          <div style={{ padding: "36px 24px", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(59,109,17,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <span style={{ fontSize: 26 }}>✓</span>
            </div>
            <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#1A1917" }}>NF-e solicitada</h2>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "#78716C", lineHeight: 1.5 }}>
              Enviado para o supervisor. A NF-e será emitida em breve.
            </p>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: "100%", height: 44, borderRadius: 10,
                background: "#EF9F27", color: "#1A1917",
                fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer",
              }}
            >
              Concluir
            </button>
          </div>
        ) : (
          <>
            <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid #E4E2DC", background: "#F8F7F4" }}>
              <p style={{ margin: 0, fontSize: 10, color: "#A8A29E", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                {saleCode}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 17, fontWeight: 700, color: "#1A1917" }}>
                Emitir Nota Fiscal-e?
              </p>
            </div>

            <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 11, color: "#A8A29E", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  CPF ou CNPJ do cliente
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    value={applyDocMask(digits)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "").slice(0, 14);
                      setDigits(raw);
                      setCustomerName(null); setCustomerId(null); setError("");
                    }}
                    onKeyDown={(e) => { if (e.key === "Enter" && docValid) void handleSearch(); }}
                    placeholder="000.000.000-00"
                    style={{
                      flex: 1, height: 42,
                      background: "#F8F7F4", border: "1px solid #E4E2DC",
                      borderRadius: 8, padding: "0 12px",
                      fontSize: 15, fontWeight: 600, color: "#1A1917",
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => void handleSearch()}
                    disabled={searching || !docValid}
                    style={{
                      height: 42, borderRadius: 8, padding: "0 14px",
                      background: docValid ? "#F0EEE9" : "#F8F7F4",
                      border: "1px solid #E4E2DC",
                      color: docValid ? "#78716C" : "#C7C5BF",
                      fontSize: 12, fontWeight: 600,
                      cursor: docValid && !searching ? "pointer" : "not-allowed",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {searching ? "…" : "Buscar"}
                  </button>
                </div>
              </div>

              {customerName && (
                <div style={{
                  background: "rgba(59,109,17,0.06)", border: "1px solid rgba(59,109,17,0.25)",
                  borderRadius: 8, padding: "10px 14px",
                }}>
                  <p style={{ margin: 0, fontSize: 10, color: "#3B6D11", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Cliente encontrado
                  </p>
                  <p style={{ margin: "3px 0 0", fontSize: 13, fontWeight: 700, color: "#1A1917" }}>
                    {customerName}
                  </p>
                </div>
              )}

              {error && (
                <p style={{
                  margin: 0, fontSize: 12, color: "#57534E",
                  background: "#F8F7F4", borderRadius: 6, padding: "8px 12px",
                  lineHeight: 1.4,
                }}>
                  {error}
                </p>
              )}

              <button
                type="button"
                disabled={loading || !digits}
                onClick={() => void handleRequest()}
                style={{
                  height: 46, borderRadius: 10, marginTop: 4,
                  background: digits ? "#1A1917" : "#F0EEE9",
                  color: digits ? "#FFFFFF" : "#A8A29E",
                  fontWeight: 700, fontSize: 14, border: "none",
                  cursor: digits && !loading ? "pointer" : "not-allowed",
                  transition: "all 150ms",
                }}
              >
                {loading ? "Solicitando…" : "Solicitar NF-e"}
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "none", border: "none",
                  fontSize: 13, color: "#A8A29E",
                  cursor: "pointer", padding: "2px 0", textAlign: "center",
                }}
              >
                Pular — venda sem NF
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
