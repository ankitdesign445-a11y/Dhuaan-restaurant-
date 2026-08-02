import React, { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw, TrendingUp, Flame, PieChart, ListOrdered } from "lucide-react";
import { useThemeC, useLangC, rupee, CATEGORIES } from "./shared";

export default function OwnerPanel({ orders, onExit, onRefresh, menuItems, restaurantInfo, onSaveMenuConfig }) {
  const { C } = useThemeC();
  const { t } = useLangC();
  const [subTab, setSubTab] = useState("analytics");

  const [draftMenu, setDraftMenu] = useState(menuItems);
  const [draftInfo, setDraftInfo] = useState(restaurantInfo);
  const [savedFlash, setSavedFlash] = useState(false);
  const [newDish, setNewDish] = useState({ name: "", nameHi: "", desc: "", price: "", cat: CATEGORIES[0].en, veg: true });

  useEffect(() => { setDraftMenu(menuItems); }, [menuItems]);
  useEffect(() => { setDraftInfo(restaurantInfo); }, [restaurantInfo]);

  const updateDish = (id, field, value) => setDraftMenu((list) => list.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  const deleteDish = (id) => setDraftMenu((list) => list.filter((d) => d.id !== id));
  const addDish = () => {
    if (!newDish.name.trim() || !newDish.price) return;
    const id = "d" + Date.now();
    setDraftMenu((list) => [...list, { ...newDish, id, price: Number(newDish.price) }]);
    setNewDish({ name: "", nameHi: "", desc: "", price: "", cat: CATEGORIES[0].en, veg: true });
  };
  const saveAll = async () => {
    await onSaveMenuConfig(draftMenu, draftInfo);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((a, o) => a + o.total, 0);
  const dineInCount = orders.filter((o) => o.mode === "dinein").length;
  const takeawayCount = orders.length - dineInCount;

  const itemCounts = {};
  orders.forEach((o) => o.items.forEach((i) => { itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty; }));
  const topItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCount = topItems.length ? topItems[0][1] : 1;

  const catRevenue = {};
  orders.forEach((o) => o.items.forEach((i) => { catRevenue[i.cat || "Other"] = (catRevenue[i.cat || "Other"] || 0) + i.qty * i.price; }));
  const catEntries = Object.entries(catRevenue).sort((a, b) => b[1] - a[1]);
  const maxCatRev = catEntries.length ? catEntries[0][1] : 1;

  const inputStyle = { width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 13 };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 60px", fontFamily: "'Inter', sans-serif", background: C.bg, color: C.text, minHeight: "100vh" }}>
      <button onClick={onExit} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 13, display: "flex", alignItems: "center", gap: 6, marginBottom: 18 }}><ArrowLeft size={15} /> {t.backToCustomer}</button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h1 className="disp" style={{ fontSize: 26, margin: 0, display: "flex", alignItems: "center", gap: 10 }}><TrendingUp size={22} color={C.turmeric} /> {t.ownerPanel}</h1>
        {subTab === "analytics" && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, color: C.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.curry, display: "inline-block" }} /> Live
            </span>
            <button onClick={onRefresh} style={{ background: C.surfaceLight, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}><RefreshCw size={13} /> {t.refresh}</button>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 22, borderBottom: `1px solid ${C.border}`, paddingBottom: 12 }}>
        {[["analytics", t.ownerTabAnalytics], ["menu", t.ownerTabMenu], ["details", t.ownerTabDetails]].map(([key, label]) => (
          <button key={key} onClick={() => setSubTab(key)} style={{ padding: "7px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, border: "none", background: subTab === key ? C.ember : C.surfaceLight, color: subTab === key ? "#fff" : C.textMuted }}>{label}</button>
        ))}
      </div>

      {subTab === "analytics" && (
      <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>{t.totalOrders}</div>
          <div className="disp" style={{ fontSize: 30, fontWeight: 700 }}>{totalOrders}</div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>{t.totalRevenue}</div>
          <div className="disp mono" style={{ fontSize: 30, fontWeight: 700, color: C.turmeric }}>{rupee(totalRevenue)}</div>
        </div>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><Flame size={14} color={C.ember} /> {t.topDishes}</div>
        {topItems.length === 0 && <p style={{ color: C.textMuted, fontSize: 13 }}>{t.noOrders}</p>}
        {topItems.map(([name, qty]) => (
          <div key={name} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}><span>{name}</span><span className="mono" style={{ color: C.textMuted }}>{qty}</span></div>
            <div style={{ height: 6, background: C.surfaceLight, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(qty / maxCount) * 100}%`, background: C.ember, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><PieChart size={14} color={C.turmeric} /> {t.revenueByCat}</div>
        {catEntries.map(([cat, rev]) => (
          <div key={cat} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}><span>{cat}</span><span className="mono" style={{ color: C.textMuted }}>{rupee(rev)}</span></div>
            <div style={{ height: 6, background: C.surfaceLight, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(rev / maxCatRev) * 100}%`, background: C.turmeric, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>{t.ordersByMode}</div>
        <div style={{ display: "flex", gap: 20, fontSize: 13 }}>
          <span>{t.dineIn}: <b className="mono">{dineInCount}</b></span>
          <span>{t.takeaway}: <b className="mono">{takeawayCount}</b></span>
        </div>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><ListOrdered size={14} /> {t.recentOrders}</div>
        {orders.slice(0, 8).map((o) => (
          <div key={o.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "8px 0", borderBottom: `1px solid ${C.border}`, color: C.textMuted }}>
            <span>#{o.id} · {o.mode === "dinein" ? `Table ${o.table}` : o.name}</span>
            <span className="mono">{rupee(o.total)}</span>
          </div>
        ))}
      </div>
      </>
      )}

      {subTab === "menu" && (
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
            {draftMenu.map((d) => (
              <div key={d.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <input style={inputStyle} value={d.name} onChange={(e) => updateDish(d.id, "name", e.target.value)} placeholder={t.dishNameEn} />
                  <input style={inputStyle} value={d.nameHi || ""} onChange={(e) => updateDish(d.id, "nameHi", e.target.value)} placeholder={t.dishNameHiLabel} />
                </div>
                <input style={{ ...inputStyle, marginBottom: 8 }} value={d.desc} onChange={(e) => updateDish(d.id, "desc", e.target.value)} placeholder={t.description} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: 8, alignItems: "center" }}>
                  <input type="number" style={inputStyle} value={d.price} onChange={(e) => updateDish(d.id, "price", Number(e.target.value))} placeholder={t.price} />
                  <select style={inputStyle} value={d.cat} onChange={(e) => updateDish(d.id, "cat", e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c.en} value={c.en}>{c.en}</option>)}
                  </select>
                  <button onClick={() => updateDish(d.id, "veg", !d.veg)} style={{ padding: "8px 10px", borderRadius: 6, border: `1px solid ${d.veg ? C.curry : C.ember}`, background: "transparent", color: d.veg ? C.curry : C.ember, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                    {d.veg ? t.vegLabel : t.nonVegLabel}
                  </button>
                  <button onClick={() => deleteDish(d.id)} style={{ padding: "8px 10px", borderRadius: 6, border: `1px solid ${C.ember}`, background: "transparent", color: C.ember, fontSize: 12 }}>
                    {t.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: C.surface, border: `1px dashed ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{t.addDish}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <input style={inputStyle} value={newDish.name} onChange={(e) => setNewDish({ ...newDish, name: e.target.value })} placeholder={t.dishNameEn} />
              <input style={inputStyle} value={newDish.nameHi} onChange={(e) => setNewDish({ ...newDish, nameHi: e.target.value })} placeholder={t.dishNameHiLabel} />
            </div>
            <input style={{ ...inputStyle, marginBottom: 8 }} value={newDish.desc} onChange={(e) => setNewDish({ ...newDish, desc: e.target.value })} placeholder={t.description} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, marginBottom: 10 }}>
              <input type="number" style={inputStyle} value={newDish.price} onChange={(e) => setNewDish({ ...newDish, price: e.target.value })} placeholder={t.price} />
              <select style={inputStyle} value={newDish.cat} onChange={(e) => setNewDish({ ...newDish, cat: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c.en} value={c.en}>{c.en}</option>)}
              </select>
              <button onClick={() => setNewDish({ ...newDish, veg: !newDish.veg })} style={{ padding: "8px 10px", borderRadius: 6, border: `1px solid ${newDish.veg ? C.curry : C.ember}`, background: "transparent", color: newDish.veg ? C.curry : C.ember, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                {newDish.veg ? t.vegLabel : t.nonVegLabel}
              </button>
            </div>
            <button onClick={addDish} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: C.turmeric, color: "#fff", fontWeight: 700, fontSize: 13 }}>{t.addDish}</button>
          </div>

          <button onClick={saveAll} style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: C.ember, color: "#fff", fontWeight: 700, fontSize: 14 }}>
            {savedFlash ? `✓ ${t.savedMsg}` : t.saveChanges}
          </button>
        </div>
      )}

      {subTab === "details" && (
        <div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
            <input style={inputStyle} value={draftInfo.name} onChange={(e) => setDraftInfo({ ...draftInfo, name: e.target.value })} placeholder="Restaurant name" />
            <input style={inputStyle} value={draftInfo.tagline} onChange={(e) => setDraftInfo({ ...draftInfo, tagline: e.target.value })} placeholder="Tagline" />
            <input style={inputStyle} value={draftInfo.address} onChange={(e) => setDraftInfo({ ...draftInfo, address: e.target.value })} placeholder={t.location} />
            <input style={inputStyle} value={draftInfo.hours} onChange={(e) => setDraftInfo({ ...draftInfo, hours: e.target.value })} placeholder={t.hours} />
            <input style={inputStyle} value={draftInfo.phone} onChange={(e) => setDraftInfo({ ...draftInfo, phone: e.target.value })} placeholder={t.phone} />
            <input type="number" step="0.1" style={inputStyle} value={draftInfo.rating} onChange={(e) => setDraftInfo({ ...draftInfo, rating: Number(e.target.value) })} placeholder={t.rating} />
          </div>
          <button onClick={saveAll} style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: C.ember, color: "#fff", fontWeight: 700, fontSize: 14 }}>
            {savedFlash ? `✓ ${t.savedMsg}` : t.saveChanges}
          </button>
        </div>
      )}
    </div>
  );
}
