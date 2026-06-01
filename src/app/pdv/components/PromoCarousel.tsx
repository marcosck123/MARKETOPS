"use client";
import { useState, useEffect } from "react";

export type PromoItem = {
  id: string;
  title: string;
  description: string;
  badge: string;
};

type Props = {
  promotions: PromoItem[];
  companyName: string;
  slogan?: string;
};

const FALLBACK_PROMOS: PromoItem[] = [
  { id: "1", title: "Ofertas da semana", description: "Confira os melhores preços em produtos selecionados para você.", badge: "DESTAQUE" },
  { id: "2", title: "Atacado é aqui", description: "Preços especiais para compras acima de 10 unidades por produto.", badge: "ATACADO" },
  { id: "3", title: "Produtos frescos todo dia", description: "Reposição diária de estoque com qualidade garantida.", badge: "QUALIDADE" },
];

export function PromoCarousel({ promotions, companyName, slogan }: Props) {
  const items = promotions.length > 0 ? promotions : FALLBACK_PROMOS;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % items.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [items.length]);

  const item = items[current];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0f1923",
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",
        backgroundSize: "40px 40px",
        padding: "32px 28px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow top-left */}
      <div
        style={{
          position: "absolute", top: -120, left: -80, width: 340, height: 340,
          borderRadius: "50%", background: "radial-gradient(circle,rgba(239,159,39,0.12) 0%,transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div style={{ marginBottom: "auto" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: "#EF9F27", margin: 0, textTransform: "uppercase" }}>
          PDV — FRENTE DE CAIXA
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#FFFFFF", margin: "6px 0 0", letterSpacing: "0.04em" }}>
          {companyName || "MARKETOPS"}
        </h1>
        {slogan && (
          <p style={{ fontSize: 12, color: "#6B7280", margin: "4px 0 0" }}>{slogan}</p>
        )}
      </div>

      {/* Carousel card */}
      <div
        key={item.id}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "32px 0",
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.16em",
            color: "#EF9F27",
            border: "1px solid rgba(239,159,39,0.4)",
            borderRadius: 4, padding: "3px 8px", marginBottom: 16,
            textTransform: "uppercase",
          }}
        >
          {item.badge}
        </span>

        <h2
          style={{
            fontSize: 32, fontWeight: 800, color: "#FFFFFF", margin: "0 0 12px",
            lineHeight: 1.15,
          }}
        >
          {item.title}
        </h2>

        <p style={{ fontSize: 15, color: "#9CA3AF", margin: 0, lineHeight: 1.6, maxWidth: 320 }}>
          {item.description}
        </p>
      </div>

      {/* Dots */}
      <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            style={{
              height: 4, borderRadius: 2,
              width: i === current ? 24 : 8,
              background: i === current ? "#EF9F27" : "rgba(255,255,255,0.2)",
              border: "none", cursor: "pointer",
              transition: "all 300ms",
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Footer slogan */}
      <p style={{ fontSize: 11, color: "#374151", margin: "16px 0 0", letterSpacing: "0.08em" }}>
        {slogan ?? "Otimizando sua operação"}
      </p>
    </div>
  );
}
