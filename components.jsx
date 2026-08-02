import React, { memo } from "react";
import { Minus, Plus, Flame } from "lucide-react";
import { rupee } from "./shared";

export const VegDot = memo(function VegDot({ veg, C }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 14, height: 14, border: `1.5px solid ${veg ? C.curry : C.ember}`,
      borderRadius: 3, flexShrink: 0,
    }} title={veg ? "Veg" : "Non-veg"}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: veg ? C.curry : C.ember }} />
    </span>
  );
});

export const InfoTile = memo(function InfoTile({ icon, label, value, C }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 2, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 14 }}>{value}</div>
    </div>
  );
});

/* A single menu row — used in the category list and in search results.
   Memoized so adding/removing one dish doesn't re-render every other row. */
export const DishRow = memo(function DishRow({ item, name, qty, isBestseller, C, addLabel, onAdd, onRemove }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <VegDot veg={item.veg} C={C} />
          <span className="disp" style={{ fontSize: 17, fontWeight: 600 }}>{name}</span>
          {isBestseller && <Flame size={14} color={C.ember} title="Bestseller" />}
        </div>
        <p style={{ color: C.textMuted, fontSize: 13, margin: "0 0 10px", lineHeight: 1.4 }}>{item.desc}</p>
        <span className="mono" style={{ color: C.turmeric, fontSize: 14 }}>{rupee(item.price)}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", alignSelf: "center" }}>
        {qty ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.surfaceLight, borderRadius: 999, padding: "4px 6px", border: `1px solid ${C.border}` }}>
            <button onClick={() => onRemove(item.id)} style={{ background: "none", border: "none", color: C.text, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={14} /></button>
            <span className="mono" style={{ fontSize: 13, minWidth: 14, textAlign: "center" }}>{qty}</span>
            <button onClick={() => onAdd(item.id)} style={{ background: "none", border: "none", color: C.text, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={14} /></button>
          </div>
        ) : (
          <button onClick={() => onAdd(item.id)} style={{ background: "transparent", border: `1px solid ${C.turmeric}`, color: C.turmeric, borderRadius: 999, padding: "8px 16px", fontSize: 13, fontWeight: 700 }}>{addLabel}</button>
        )}
      </div>
    </div>
  );
});

/* Small horizontal bestseller card. Also memoized for the same reason. */
export const BestsellerCard = memo(function BestsellerCard({ item, name, C, addLabel, onAdd }) {
  return (
    <div style={{ minWidth: 180, background: `linear-gradient(160deg, ${C.surfaceLight}, ${C.surface})`, border: `1px solid ${C.turmeric}55`, borderRadius: 14, padding: 14, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <VegDot veg={item.veg} C={C} />
        <span className="disp" style={{ fontSize: 14, fontWeight: 600 }}>{name}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <span className="mono" style={{ fontSize: 13, color: C.turmeric }}>{rupee(item.price)}</span>
        <button onClick={() => onAdd(item.id)} style={{ background: "transparent", border: `1px solid ${C.turmeric}`, color: C.turmeric, borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 700 }}>{addLabel}</button>
      </div>
    </div>
  );
});
