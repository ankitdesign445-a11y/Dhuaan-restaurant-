import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import {
  MapPin, Phone, Clock, Star, ShoppingBag, Plus, Minus, X,
  Flame, ChefHat, Check, Users, Sun, Moon,
  Globe, Lock, Search,
} from "lucide-react";
import {
  saveOrder, getOrders, updateOrderStatus, saveReview, getReviews,
  getMenuConfig, saveMenuConfig as saveMenuConfigRemote,
} from "./firebase";
import {
  TOTAL_TABLES, OWNER_PIN, STAFF_PIN, DEFAULT_RESTAURANT, CATEGORIES, DEFAULT_MENU,
  DARK, LIGHT, T, ThemeCtx, LangCtx, rupee,
} from "./shared";
import { InfoTile, DishRow, BestsellerCard } from "./components";

// Heavy, occasionally-used screens are code-split so the first customer
// visit only downloads the ordering UI, not the staff/owner dashboards.
const StaffView = lazy(() => import("./StaffView"));
const OwnerPanel = lazy(() => import("./OwnerPanel"));
const PinLock = lazy(() => import("./PinLock"));

function ViewLoader({ C }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", border: `3px solid ${C.border}`, borderTopColor: C.ember, animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* Thin wrappers around the Firebase module, kept here so the rest of the
   app doesn't care whether data comes from Firestore or somewhere else. */
async function readOrders() { return getOrders(); }
async function saveNewOrder(order) { return saveOrder(order); }
async function readReviews() { return getReviews(); }
async function saveNewReview(review) { return saveReview(review); }
async function readMenuConfig() { return getMenuConfig(); }
async function writeMenuConfig(config) { return saveMenuConfigRemote(config); }

export default function App() {
  const [mode, setMode] = useState("dark");
  const [lang, setLang] = useState("en");
  const C = mode === "dark" ? DARK : LIGHT;
  const t = T[lang];

  const [tab, setTab] = useState("menu");
  const [menuItems, setMenuItems] = useState(DEFAULT_MENU);
  const [restaurantInfo, setRestaurantInfo] = useState(DEFAULT_RESTAURANT);
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].en);
  const [cart, setCart] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderMode, setOrderMode] = useState("dinein");
  const [tableNumber, setTableNumber] = useState("");
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [error, setError] = useState("");
  const [tableLocked, setTableLocked] = useState(false);
  const [bestsellerIds, setBestsellerIds] = useState([]);

  const [staffView, setStaffView] = useState(false);
  const [staffUnlocked, setStaffUnlocked] = useState(false);
  const [staffOrders, setStaffOrders] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);

  const [ownerView, setOwnerView] = useState(false);
  const [ownerUnlocked, setOwnerUnlocked] = useState(false);
  const [ownerOrders, setOwnerOrders] = useState([]);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [reviews, setReviews] = useState([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [trackOpen, setTrackOpen] = useState(false);
  const [trackId, setTrackId] = useState("");
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState("");

  const baseUrl = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tb = params.get("table");
    if (tb) { setOrderMode("dinein"); setTableNumber(tb); setTableLocked(true); }
    readOrders().then((list) => {
      const counts = {};
      list.forEach((o) => o.items.forEach((i) => {
        const m = DEFAULT_MENU.find((mm) => mm.name === i.name);
        if (m) counts[m.id] = (counts[m.id] || 0) + i.qty;
      }));
      setBestsellerIds(Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id]) => id));
    });
    readReviews().then(setReviews);
    readMenuConfig().then((cfg) => {
      if (cfg) {
        if (cfg.menu) setMenuItems(cfg.menu);
        if (cfg.restaurant) setRestaurantInfo(cfg.restaurant);
      }
    });
  }, []);

  const cartItems = useMemo(
    () => Object.entries(cart).filter(([, q]) => q > 0).map(([id, qty]) => ({ ...menuItems.find((m) => m.id === id), qty })),
    [cart, menuItems]
  );
  const cartCount = useMemo(() => cartItems.reduce((a, i) => a + i.qty, 0), [cartItems]);
  const cartTotal = useMemo(() => cartItems.reduce((a, i) => a + i.qty * i.price, 0), [cartItems]);

  // Stable references so memoized DishRow/BestsellerCard don't re-render
  // just because the parent re-rendered.
  const addItem = useCallback((id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 })), []);
  const removeItem = useCallback((id) => setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] || 0) - 1) })), []);

  const canPlace = cartItems.length > 0 &&
    (orderMode === "dinein" ? tableNumber.trim().length > 0 : custName.trim().length > 0 && custPhone.trim().length >= 7);

  const placeOrder = useCallback(() => {
    if (!canPlace) { setError(orderMode === "dinein" ? t.errTable : t.errTakeaway); return; }
    setError("");
    const order = {
      id: "DH" + Math.random().toString(36).slice(2, 6).toUpperCase() + Date.now().toString().slice(-4),
      mode: orderMode,
      table: orderMode === "dinein" ? tableNumber.trim() : null,
      name: orderMode === "takeaway" ? custName.trim() : null,
      phone: orderMode === "takeaway" ? custPhone.trim() : null,
      items: cartItems.map((i) => ({ name: i.name, cat: i.cat, qty: i.qty, price: i.price })),
      total: cartTotal, status: "received", placedAt: new Date().toISOString(),
    };
    // Optimistic UI: confirm instantly, sync to Firestore in the background.
    setConfirmedOrder(order); setCart({}); setDrawerOpen(false);
    saveNewOrder(order).then((ok) => {
      if (!ok) console.error("Order could not be synced to the database, order id:", order.id);
    });
  }, [canPlace, orderMode, tableNumber, custName, custPhone, cartItems, cartTotal, t]);

  const loadStaffOrders = useCallback(async () => { setStaffLoading(true); setStaffOrders(await readOrders()); setStaffLoading(false); }, []);
  useEffect(() => { if (staffView && staffUnlocked) loadStaffOrders(); }, [staffView, staffUnlocked, loadStaffOrders]);
  useEffect(() => {
    if (!staffView || !staffUnlocked) return;
    const interval = setInterval(loadStaffOrders, 8000);
    return () => clearInterval(interval);
  }, [staffView, staffUnlocked, loadStaffOrders]);

  const submitReview = useCallback(async () => {
    if (!reviewName.trim() || !reviewComment.trim()) return;
    setReviewSubmitting(true);
    const review = { id: "RV" + Date.now(), name: reviewName.trim(), rating: reviewRating, comment: reviewComment.trim(), at: new Date().toISOString() };
    await saveNewReview(review);
    setReviews((prev) => [review, ...prev]);
    setReviewName(""); setReviewComment(""); setReviewRating(5);
    setReviewSubmitting(false);
  }, [reviewName, reviewComment, reviewRating]);

  const findOrder = useCallback(async () => {
    setTrackError(""); setTrackResult(null);
    const list = await readOrders();
    const found = list.find((o) => o.id.toLowerCase() === trackId.trim().toUpperCase().toLowerCase());
    if (found) setTrackResult(found); else setTrackError(t.orderNotFound);
  }, [trackId, t]);

  const updateStatus = useCallback(async (id, status) => {
    setStaffOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    await updateOrderStatus(id, status);
  }, []);

  const openOwner = useCallback(() => setOwnerView(true), []);

  const saveMenuConfig = useCallback(async (newMenu, newInfo) => {
    setMenuItems(newMenu);
    setRestaurantInfo(newInfo);
    await writeMenuConfig({ menu: newMenu, restaurant: newInfo });
  }, []);

  useEffect(() => {
    if (!ownerView || !ownerUnlocked) return;
    const fetchNow = async () => setOwnerOrders(await readOrders());
    fetchNow();
    const interval = setInterval(fetchNow, 10000);
    return () => clearInterval(interval);
  }, [ownerView, ownerUnlocked]);

  const dishName = useCallback((item) => (lang === "hi" ? item.nameHi || item.name : item.name), [lang]);
  const filteredMenu = useMemo(() => menuItems.filter((m) => m.cat === activeCat), [menuItems, activeCat]);
  const bestsellers = useMemo(() => menuItems.filter((m) => bestsellerIds.includes(m.id)), [menuItems, bestsellerIds]);
  const searchResults = useMemo(() => (
    searchQuery.trim()
      ? menuItems.filter((m) => (m.name + " " + (m.nameHi || "") + " " + m.desc).toLowerCase().includes(searchQuery.trim().toLowerCase()))
      : []
  ), [searchQuery, menuItems]);
  const avgReviewRating = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <ThemeCtx.Provider value={{ C, mode, setMode }}>
    <LangCtx.Provider value={{ lang, setLang, t }}>
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "'Inter', sans-serif", transition: "background .2s,color .2s" }}>
      <style>{`
        * { box-sizing: border-box; }
        .disp { font-family: 'Fraunces', serif; }
        .mono { font-family: 'Space Mono', monospace; }
        button { font-family: inherit; cursor: pointer; }
        input { font-family: inherit; }
      `}</style>

      {ownerView ? (
        <Suspense fallback={<ViewLoader C={C} />}>
          {ownerUnlocked
            ? <OwnerPanel orders={ownerOrders} onExit={() => { setOwnerView(false); setOwnerUnlocked(false); }} onRefresh={async () => setOwnerOrders(await readOrders())} menuItems={menuItems} restaurantInfo={restaurantInfo} onSaveMenuConfig={saveMenuConfig} />
            : <PinLock expectedPin={OWNER_PIN} title={T[lang].ownerPanel} onSuccess={() => setOwnerUnlocked(true)} onExit={() => setOwnerView(false)} />}
        </Suspense>
      ) : staffView ? (
        <Suspense fallback={<ViewLoader C={C} />}>
          {staffUnlocked
            ? <StaffView orders={staffOrders} loading={staffLoading} onRefresh={loadStaffOrders} onUpdateStatus={updateStatus} onExit={() => { setStaffView(false); setStaffUnlocked(false); }} baseUrl={baseUrl} />
            : <PinLock expectedPin={STAFF_PIN} title={T[lang].staffPinTitle} onSuccess={() => setStaffUnlocked(true)} onExit={() => setStaffView(false)} />}
        </Suspense>
      ) : (
        <>
          {/* HEADER */}
          <header style={{ position: "sticky", top: 0, zIndex: 20, background: mode === "dark" ? "rgba(23,18,14,0.92)" : "rgba(251,246,236,0.92)", backdropFilter: "blur(6px)", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Flame size={20} color={C.ember} />
                <span className="disp" style={{ fontSize: 22, fontWeight: 700 }}>{restaurantInfo.name}</span>
              </div>
              <nav style={{ display: "flex", gap: 4 }}>
                {[["menu", t.navMenu], ["about", t.navAbout], ["reviews", t.navReviews]].map(([key, label]) => (
                  <button key={key} onClick={() => setTab(key)} style={{ background: "transparent", border: "none", padding: "8px 10px", borderRadius: 999, color: tab === key ? C.turmeric : C.textMuted, fontWeight: 600, fontSize: 13 }}>{label}</button>
                ))}
              </nav>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => { setTab("menu"); setSearchOpen((o) => !o); }} title="Search" style={{ background: searchOpen ? C.ember : C.surfaceLight, border: `1px solid ${C.border}`, borderRadius: 999, padding: "8px 10px", color: searchOpen ? "#fff" : C.text, display: "flex", alignItems: "center" }}>
                  <Search size={14} />
                </button>
                <button onClick={() => setLang(lang === "en" ? "hi" : "en")} title="Language" style={{ background: C.surfaceLight, border: `1px solid ${C.border}`, borderRadius: 999, padding: "8px 10px", color: C.text, display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700 }}>
                  <Globe size={14} />{lang === "en" ? "हिं" : "EN"}
                </button>
                <button onClick={() => setMode(mode === "dark" ? "light" : "dark")} title="Theme" style={{ background: C.surfaceLight, border: `1px solid ${C.border}`, borderRadius: 999, padding: "8px 10px", color: C.text, display: "flex", alignItems: "center" }}>
                  {mode === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                </button>
                <button onClick={() => setDrawerOpen(true)} aria-label="cart" style={{ position: "relative", background: C.surfaceLight, border: `1px solid ${C.border}`, borderRadius: 999, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, color: C.text }}>
                  <ShoppingBag size={16} />
                  <span className="mono" style={{ fontSize: 13 }}>{rupee(cartTotal)}</span>
                  {cartCount > 0 && <span style={{ position: "absolute", top: -6, right: -6, background: C.ember, color: "#fff", borderRadius: "50%", width: 20, height: 20, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{cartCount}</span>}
                </button>
              </div>
            </div>
          </header>

          {/* HERO */}
          <section style={{ padding: "56px 20px 32px", maxWidth: 900, margin: "0 auto", textAlign: "center", borderBottom: `1px solid ${C.border}` }}>
            {tableLocked && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(138,163,110,0.15)", border: `1px solid ${C.curry}`, color: C.curry, borderRadius: 999, padding: "6px 16px", fontSize: 13, fontWeight: 600, marginBottom: 18 }}>
                <Users size={14} /> {t.tableBanner(tableNumber)}
              </div>
            )}
            <div style={{ fontSize: 12, letterSpacing: 2, color: C.turmeric, marginBottom: 14, fontWeight: 600 }}>{t.kicker}</div>
            <h1 className="disp" style={{ fontSize: "clamp(32px,7vw,60px)", fontWeight: 700, lineHeight: 1.08, margin: "0 0 16px" }}>{restaurantInfo.tagline}</h1>
            <p style={{ color: C.textMuted, fontSize: 15, maxWidth: 480, margin: "0 auto 28px" }}>{t.heroSubtitle}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 24px", justifyContent: "center", fontSize: 14, color: C.textMuted }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin size={15} color={C.ember} />{restaurantInfo.address}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock size={15} color={C.ember} />{restaurantInfo.hours}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Star size={15} color={C.turmeric} />{restaurantInfo.rating}</span>
            </div>
          </section>

          <main style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px 100px" }}>
            {searchOpen && tab === "menu" && (
              <div style={{ position: "relative", marginBottom: 24 }}>
                <Search size={16} color={C.textMuted} style={{ position: "absolute", left: 14, top: 14 }} />
                <input
                  autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  style={{ width: "100%", padding: "12px 14px 12px 38px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 14 }}
                />
              </div>
            )}

            {tab === "menu" && searchQuery.trim() ? (
              <div>
                <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 14 }}>{t.searchResults}: "{searchQuery.trim()}"</div>
                {searchResults.length === 0 && <p style={{ color: C.textMuted, fontSize: 14 }}>{t.noResults}</p>}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {searchResults.map((item) => (
                    <DishRow key={item.id} item={item} name={dishName(item)} qty={cart[item.id]} isBestseller={bestsellerIds.includes(item.id)} C={C} addLabel={t.add} onAdd={addItem} onRemove={removeItem} />
                  ))}
                </div>
              </div>
            ) : tab === "menu" && (
              <>
                {bestsellers.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>{t.bestsellers}</div>
                    <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
                      {bestsellers.map((item) => (
                        <BestsellerCard key={item.id} item={item} name={dishName(item)} C={C} addLabel={t.add} onAdd={addItem} />
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 24 }}>
                  {CATEGORIES.map((c) => (
                    <button key={c.en} onClick={() => setActiveCat(c.en)} style={{ whiteSpace: "nowrap", padding: "8px 16px", borderRadius: 999, border: `1px solid ${activeCat === c.en ? C.ember : C.border}`, background: activeCat === c.en ? C.ember : "transparent", color: activeCat === c.en ? "#fff" : C.textMuted, fontSize: 13, fontWeight: 600 }}>
                      {lang === "hi" ? c.hi : c.en}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {filteredMenu.map((item) => (
                    <DishRow key={item.id} item={item} name={dishName(item)} qty={cart[item.id]} isBestseller={bestsellerIds.includes(item.id)} C={C} addLabel={t.add} onAdd={addItem} onRemove={removeItem} />
                  ))}
                </div>
              </>
            )}

            {tab === "about" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
                  <h2 className="disp" style={{ fontSize: 22, marginTop: 0 }}>{t.ourStory}</h2>
                  <p style={{ color: C.textMuted, lineHeight: 1.7, fontSize: 15 }}>{t.storyText}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <InfoTile icon={<MapPin size={18} color={C.ember} />} label={t.location} value={restaurantInfo.address} C={C} />
                  <InfoTile icon={<Clock size={18} color={C.ember} />} label={t.hours} value={restaurantInfo.hours} C={C} />
                  <InfoTile icon={<Phone size={18} color={C.ember} />} label={t.phone} value={restaurantInfo.phone} C={C} />
                  <InfoTile icon={<Star size={18} color={C.turmeric} />} label={t.rating} value={`${restaurantInfo.rating} / 5`} C={C} />
                </div>
              </div>
            )}

            {tab === "reviews" && (
              <div>
                {avgReviewRating && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 14, color: C.textMuted }}>
                    <Star size={16} color={C.turmeric} fill={C.turmeric} />
                    <b style={{ color: C.text }}>{avgReviewRating}</b> {t.avgRating} {reviews.length} {t.reviewsWord}
                  </div>
                )}

                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, marginBottom: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{t.writeReview}</div>
                  <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setReviewRating(n)} style={{ background: "none", border: "none", padding: 2 }}>
                        <Star size={20} color={C.turmeric} fill={n <= reviewRating ? C.turmeric : "none"} />
                      </button>
                    ))}
                  </div>
                  <input value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder={t.reviewNamePh} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 14, marginBottom: 10 }} />
                  <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder={t.reviewCommentPh} rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 14, marginBottom: 10, resize: "vertical" }} />
                  <button onClick={submitReview} disabled={reviewSubmitting} style={{ background: C.ember, border: "none", color: "#fff", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 700, opacity: reviewSubmitting ? 0.7 : 1 }}>{t.submitReview}</button>
                </div>

                {reviews.length === 0 ? (
                  <p style={{ color: C.textMuted, fontSize: 14 }}>{t.noReviews}</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {reviews.map((r) => (
                      <div key={r.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</span>
                          <div style={{ display: "flex", gap: 1 }}>
                            {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={13} color={C.turmeric} fill={n <= r.rating ? C.turmeric : "none"} />)}
                          </div>
                        </div>
                        <p style={{ color: C.textMuted, fontSize: 13, margin: 0, lineHeight: 1.5 }}>{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>

          <footer style={{ borderTop: `1px solid ${C.border}`, padding: "18px 20px", textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={() => { setTrackOpen(true); setTrackResult(null); setTrackError(""); setTrackId(""); }} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 12, textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
              <Search size={13} /> {t.trackOrder}
            </button>
            <button onClick={() => setStaffView(true)} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 12, textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
              <ChefHat size={13} /> {t.staffLink}
            </button>
            <button onClick={openOwner} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 12, textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
              <Lock size={13} /> {t.ownerLink}
            </button>
          </footer>

          {/* FLOATING CART BUTTON (mobile-friendly, bottom) */}
          {cartCount > 0 && !drawerOpen && (
            <button
              onClick={() => setDrawerOpen(true)}
              style={{
                position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 30,
                background: C.ember, color: "#fff", border: "none", borderRadius: 999,
                padding: "14px 24px", display: "flex", alignItems: "center", gap: 10,
                boxShadow: "0 10px 30px rgba(0,0,0,0.35)", fontSize: 14, fontWeight: 700,
              }}
            >
              <ShoppingBag size={16} /> {t.yourOrder} · {cartCount} · <span className="mono">{rupee(cartTotal)}</span>
            </button>
          )}

          {/* TRACK ORDER MODAL */}
          {trackOpen && (
            <div style={{ position: "fixed", inset: 0, zIndex: 55, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
              <div onClick={() => setTrackOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)" }} />
              <div style={{ position: "relative", width: "min(340px,100%)", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h3 className="disp" style={{ margin: 0, fontSize: 18 }}>{t.trackOrderTitle}</h3>
                  <button onClick={() => setTrackOpen(false)} style={{ background: "none", border: "none", color: C.text }}><X size={18} /></button>
                </div>
                <input value={trackId} onChange={(e) => setTrackId(e.target.value)} placeholder={t.enterOrderId} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 14, marginBottom: 10 }} />
                <button onClick={findOrder} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: C.ember, color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>{t.findOrder}</button>
                {trackError && <p style={{ color: C.ember, fontSize: 13 }}>{trackError}</p>}
                {trackResult && (
                  <div style={{ background: C.surfaceLight, borderRadius: 10, padding: 14 }}>
                    <div className="mono" style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>#{trackResult.id}</div>
                    <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 6 }}>{t.currentStatus}: <b style={{ color: C.turmeric, textTransform: "uppercase" }}>{trackResult.status}</b></div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>{trackResult.mode === "dinein" ? `Table ${trackResult.table}` : trackResult.name}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CART DRAWER */}
          {drawerOpen && (
            <div style={{ position: "fixed", inset: 0, zIndex: 40, display: "flex", justifyContent: "flex-end" }}>
              <div onClick={() => setDrawerOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />
              <div style={{ position: "relative", width: "min(400px, 100%)", height: "100%", background: C.bg, borderLeft: `1px solid ${C.border}`, padding: 20, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <h2 className="disp" style={{ margin: 0, fontSize: 22 }}>{t.yourOrder}</h2>
                  <button onClick={() => setDrawerOpen(false)} style={{ background: "none", border: "none", color: C.text }}><X size={20} /></button>
                </div>

                {cartItems.length === 0 ? (
                  <p style={{ color: C.textMuted }}>{t.emptyCart}</p>
                ) : (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                      {cartItems.map((i) => (
                        <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{dishName(i)}</div>
                            <div className="mono" style={{ fontSize: 12, color: C.textMuted }}>{i.qty} × {rupee(i.price)}</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <button onClick={() => removeItem(i.id)} style={{ background: C.surfaceLight, border: `1px solid ${C.border}`, borderRadius: "50%", width: 26, height: 26, color: C.text, display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={12} /></button>
                            <span className="mono" style={{ minWidth: 12, textAlign: "center", fontSize: 13 }}>{i.qty}</span>
                            <button onClick={() => addItem(i.id)} style={{ background: C.surfaceLight, border: `1px solid ${C.border}`, borderRadius: "50%", width: 26, height: 26, color: C.text, display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={12} /></button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16, borderTop: `1px solid ${C.border}`, paddingTop: 14, marginBottom: 20 }}>
                      <span>{t.total}</span><span className="mono">{rupee(cartTotal)}</span>
                    </div>

                    {!tableLocked && (
                      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                        {[["dinein", t.dineIn], ["takeaway", t.takeaway]].map(([key, label]) => (
                          <button key={key} onClick={() => setOrderMode(key)} style={{ flex: 1, padding: "10px 8px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: `1px solid ${orderMode === key ? C.turmeric : C.border}`, background: orderMode === key ? `${C.turmeric}22` : "transparent", color: orderMode === key ? C.turmeric : C.textMuted }}>{label}</button>
                        ))}
                      </div>
                    )}

                    {orderMode === "dinein" ? (
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 12, color: C.textMuted, display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><Users size={13} /> {t.tableNumber}</label>
                        <input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} readOnly={tableLocked} placeholder="e.g. 7" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: tableLocked ? C.surfaceLight : C.surface, color: C.text, fontSize: 14 }} />
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
                        <input value={custName} onChange={(e) => setCustName(e.target.value)} placeholder={t.yourName} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 14 }} />
                        <input value={custPhone} onChange={(e) => setCustPhone(e.target.value)} placeholder={t.phoneNumber} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 14 }} />
                      </div>
                    )}

                    {error && <p style={{ color: C.ember, fontSize: 13, marginTop: 0 }}>{error}</p>}

                    <button onClick={placeOrder} style={{ marginTop: "auto", width: "100%", padding: "14px", borderRadius: 10, border: "none", background: C.ember, color: "#fff", fontWeight: 700, fontSize: 15 }}>
                      {t.placeOrder} · {rupee(cartTotal)}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* CONFIRMATION TICKET */}
          {confirmedOrder && (
            <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
              <div onClick={() => setConfirmedOrder(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} />
              <div style={{ position: "relative", width: "min(340px, 100%)", background: "#F2E8D8", color: "#241A14", borderRadius: 4, padding: "28px 24px", fontFamily: "'Space Mono', monospace", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <Flame size={22} color={C.ember} />
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, marginTop: 6 }}>{restaurantInfo.name}</div>
                  <div style={{ fontSize: 11, color: "#6b5c47" }}>{t.orderToken}</div>
                </div>
                <div style={{ borderTop: "1px dashed #6b5c47", borderBottom: "1px dashed #6b5c47", padding: "12px 0", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>#{confirmedOrder.id}</div>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>{confirmedOrder.mode === "dinein" ? `Table ${confirmedOrder.table}` : `Takeaway — ${confirmedOrder.name}`}</div>
                  <div style={{ fontSize: 11, color: "#6b5c47" }}>{new Date(confirmedOrder.placedAt).toLocaleTimeString()}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12, fontSize: 12 }}>
                  {confirmedOrder.items.map((i, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}><span>{i.qty} × {i.name}</span><span>{rupee(i.qty * i.price)}</span></div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 14, borderTop: "1px dashed #6b5c47", paddingTop: 10 }}>
                  <span>TOTAL</span><span>{rupee(confirmedOrder.total)}</span>
                </div>
                <div style={{ textAlign: "center", marginTop: 18, fontSize: 11, color: "#6b5c47", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Check size={13} /> {t.sentToKitchen}
                </div>
                <button onClick={() => setConfirmedOrder(null)} style={{ marginTop: 16, width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #6b5c47", background: "transparent", color: "#241A14", fontSize: 12, fontWeight: 700 }}>{t.done}</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
    </LangCtx.Provider>
    </ThemeCtx.Provider>
  );
}
