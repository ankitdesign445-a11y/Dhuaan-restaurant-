import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, RefreshCw, Bell } from "lucide-react";
import { useThemeC, useLangC, rupee, playBeep, TOTAL_TABLES } from "./shared";

export default function StaffView({ orders, loading, onRefresh, onUpdateStatus, onExit, baseUrl }) {
  const { C } = useThemeC();
  const { t } = useLangC();
  const [subTab, setSubTab] = useState("orders");
  const [copiedTable, setCopiedTable] = useState(null);
  const [toast, setToast] = useState(null);
  const seenIds = useRef(null);

  useEffect(() => {
    if (seenIds.current === null) {
      seenIds.current = new Set(orders.map((o) => o.id));
      return;
    }
    const fresh = orders.filter((o) => !seenIds.current.has(o.id));
    if (fresh.length > 0) {
      playBeep();
      const o = fresh[0];
      setToast(`${t.newOrderAlert} ${o.mode === "dinein" ? "Table " + o.table : o.name}`);
      setTimeout(() => setToast(null), 4500);
      try {
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification(t.newOrderAlert, { body: o.mode === "dinein" ? `Table ${o.table}` : o.name });
        }
      } catch {}
    }
    seenIds.current = new Set(orders.map((o) => o.id));
  }, [orders]);

  useEffect(() => {
    try { if (typeof Notification !== "undefined" && Notification.permission === "default") Notification.requestPermission(); } catch {}
  }, []);

  const statusFlow = ["received", "preparing", "ready", "served"];
  const nextStatus = (s) => statusFlow[Math.min(statusFlow.indexOf(s) + 1, statusFlow.length - 1)];
  const statusColor = { received: C.ember, preparing: C.turmeric, ready: C.curry, served: C.textMuted };

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((a, o) => a + o.total, 0);
  const itemCounts = {};
  orders.forEach((o) => o.items.forEach((i) => { itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty; }));
  const topItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const copyLink = (link, n) => {
    if (navigator.clipboard) navigator.clipboard.writeText(link);
    setCopiedTable(n); setTimeout(() => setCopiedTable(null), 1500);
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 20px 60px", fontFamily: "'Inter', sans-serif", background: C.bg, color: C.text, minHeight: "100vh" }}>
      {toast && (
        <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 60, background: C.ember, color: "#fff", padding: "12px 20px", borderRadius: 999, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 10px 30px rgba(0,0,0,0.35)" }}>
          <Bell size={15} /> {toast}
        </div>
      )}

      <button onClick={onExit} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 13, display: "flex", alignItems: "center", gap: 6, marginBottom: 18 }}><ArrowLeft size={15} /> {t.backToCustomer}</button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 className="disp" style={{ fontSize: 26, margin: 0 }}>{t.staffDash}</h1>
        {subTab === "orders" && <button onClick={onRefresh} style={{ background: C.surfaceLight, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}><RefreshCw size={13} /> {t.refresh}</button>}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 22, borderBottom: `1px solid ${C.border}`, paddingBottom: 12 }}>
        {[["orders", t.ordersTab], ["qr", t.qrTab], ["summary", t.summaryTab]].map(([key, label]) => (
          <button key={key} onClick={() => setSubTab(key)} style={{ padding: "7px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, border: "none", background: subTab === key ? C.ember : C.surfaceLight, color: subTab === key ? "#fff" : C.textMuted }}>{label}</button>
        ))}
      </div>

      {subTab === "qr" && (
        <div>
          <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 20 }}>{t.qrHelp}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14 }}>
            {Array.from({ length: TOTAL_TABLES }, (_, i) => i + 1).map((n) => {
              const link = `${baseUrl}?table=${n}`;
              return (
                <div key={n} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Table {n}</div>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`}
                    alt={`QR ${n}`}
                    loading="lazy"
                    decoding="async"
                    style={{ width: "100%", borderRadius: 8, background: "#fff" }}
                  />
                  <button onClick={() => copyLink(link, n)} style={{ marginTop: 8, width: "100%", background: "none", border: `1px solid ${C.border}`, color: C.textMuted, borderRadius: 6, padding: "5px 0", fontSize: 11 }}>{copiedTable === n ? t.copied : t.copyLink}</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subTab === "summary" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>{t.totalOrders}</div>
              <div className="disp" style={{ fontSize: 28, fontWeight: 700 }}>{totalOrders}</div>
            </div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>{t.totalRevenue}</div>
              <div className="disp mono" style={{ fontSize: 28, fontWeight: 700, color: C.turmeric }}>{rupee(totalRevenue)}</div>
            </div>
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>{t.topDishes}</div>
            {topItems.length === 0 && <p style={{ color: C.textMuted, fontSize: 13 }}>{t.noOrders}</p>}
            {topItems.map(([name, qty]) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}><span>{name}</span><span className="mono" style={{ color: C.textMuted }}>{qty} {t.sold}</span></div>
            ))}
          </div>
        </div>
      )}

      {subTab === "orders" && (
        <>
          {loading && <p style={{ color: C.textMuted }}>Loading…</p>}
          {!loading && orders.length === 0 && <p style={{ color: C.textMuted }}>{t.noOrders}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {orders.map((o) => (
              <div key={o.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div className="mono" style={{ fontSize: 13, fontWeight: 700 }}>#{o.id}</div>
                    <div style={{ fontSize: 13, color: C.textMuted }}>{o.mode === "dinein" ? `Table ${o.table}` : `${o.name} · ${o.phone}`}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: statusColor[o.status], border: `1px solid ${statusColor[o.status]}`, borderRadius: 999, padding: "3px 10px" }}>{o.status}</span>
                </div>
                <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 10, lineHeight: 1.6 }}>
                  {o.items.map((i, idx) => <div key={idx}>{i.qty} × {i.name}</div>)}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="mono" style={{ fontWeight: 700 }}>{rupee(o.total)}</span>
                  {o.status !== "served" && <button onClick={() => onUpdateStatus(o.id, nextStatus(o.status))} style={{ background: "transparent", border: `1px solid ${C.turmeric}`, color: C.turmeric, borderRadius: 999, padding: "6px 14px", fontSize: 12, fontWeight: 700 }}>Mark {nextStatus(o.status)}</button>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
