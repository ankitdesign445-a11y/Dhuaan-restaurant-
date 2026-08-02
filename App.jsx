import React, { useState, useEffect, useMemo, useRef, createContext, useContext } from "react";
import {
  MapPin, Phone, Clock, Star, ShoppingBag, Plus, Minus, X,
  Flame, ChefHat, Check, Users, ArrowLeft, RefreshCw, Sun, Moon,
  Globe, Lock, TrendingUp, PieChart, ListOrdered, Search, MessageSquare, Bell, Send,
} from "lucide-react";
import {
  getOrders, saveOrders, getReviews, saveReviews, getMenuConfig, saveMenuConfig as saveMenuConfigRemote,
} from "./firebase";

/* =============================== CONFIG — DEFAULT VALUES (owner can now also edit these live from the Owner Panel) =============================== */
const TOTAL_TABLES = 12;      // how many tables you have (for QR generation)
const OWNER_PIN = "1234";     // owner/manager panel PIN — change this before real use
const STAFF_PIN = "0000";     // staff dashboard PIN — change this before real use

const DEFAULT_RESTAURANT = {
  name: "Dhuaan",
  tagline: "Fire-cooked food, from our tandoor to your table",
  address: "14 Cinnamon Lane, Bandra West, Mumbai",
  hours: "12:00 PM – 11:30 PM · Everyday",
  phone: "+91 98765 43210",
  rating: 4.6,
};

const CATEGORIES = [
  { en: "Shuru'aat", hi: "शुरुआत" },
  { en: "Tandoor", hi: "तंदूर" },
  { en: "Mains", hi: "मुख्य भोजन" },
  { en: "Biryani & Rice", hi: "बिरयानी और चावल" },
  { en: "Breads", hi: "रोटियां" },
  { en: "Sweet Endings", hi: "मिठाई" },
];

const DEFAULT_MENU = [
  { id: "s1", cat: "Shuru'aat", name: "Masala Papad", nameHi: "मसाला पापड़", desc: "Crisp papad topped with onion, tomato, chaat masala.", price: 90, veg: true },
  { id: "s2", cat: "Shuru'aat", name: "Hara Bhara Kebab", nameHi: "हरा भरा कबाब", desc: "Spinach and peas patties, pan-seared.", price: 220, veg: true },
  { id: "s3", cat: "Shuru'aat", name: "Chicken 65", nameHi: "चिकन 65", desc: "Deep-fried curry-leaf chicken, Chettinad style.", price: 290, veg: false },
  { id: "t1", cat: "Tandoor", name: "Tandoori Gobhi", nameHi: "तंदूरी गोभी", desc: "Cauliflower marinated in hung curd and spices, char-grilled.", price: 260, veg: true },
  { id: "t2", cat: "Tandoor", name: "Murgh Malai Tikka", nameHi: "मुर्ग मलाई टिक्का", desc: "Cream and cashew marinated chicken, cooked over coal.", price: 340, veg: false },
  { id: "t3", cat: "Tandoor", name: "Tandoori Jhinga", nameHi: "तंदूरी झींगा", desc: "Char-grilled tiger prawns, ajwain and mustard oil marinade.", price: 480, veg: false },
  { id: "m1", cat: "Mains", name: "Dal Dhuaan", nameHi: "दाल धुआं", desc: "Black lentils, slow-simmered overnight, smoked butter.", price: 260, veg: true },
  { id: "m2", cat: "Mains", name: "Paneer Lababdar", nameHi: "पनीर लबाबदार", desc: "Cottage cheese in a rich tomato-cashew gravy.", price: 300, veg: true },
  { id: "m3", cat: "Mains", name: "Butter Chicken", nameHi: "बटर चिकन", desc: "Tandoori chicken simmered in tomato and butter gravy.", price: 360, veg: false },
  { id: "m4", cat: "Mains", name: "Mutton Rogan Josh", nameHi: "मटन रोगन जोश", desc: "Kashmiri-style slow-cooked mutton curry.", price: 420, veg: false },
  { id: "b1", cat: "Biryani & Rice", name: "Hyderabadi Veg Biryani", nameHi: "हैदराबादी वेज बिरयानी", desc: "Layered basmati, saffron, fried onions.", price: 280, veg: true },
  { id: "b2", cat: "Biryani & Rice", name: "Lucknowi Chicken Biryani", nameHi: "लखनवी चिकन बिरयानी", desc: "Dum-cooked, served with raita and mirch salan.", price: 340, veg: false },
  { id: "r1", cat: "Breads", name: "Tandoori Roti", nameHi: "तंदूरी रोटी", desc: "Whole wheat, straight off the tandoor.", price: 45, veg: true },
  { id: "r2", cat: "Breads", name: "Butter Garlic Naan", nameHi: "बटर गार्लिक नान", desc: "Leavened flatbread, garlic and butter.", price: 75, veg: true },
  { id: "d1", cat: "Sweet Endings", name: "Gulab Jamun", nameHi: "गुलाब जामुन", desc: "Milk dumplings in cardamom-rose syrup, served warm.", price: 130, veg: true },
  { id: "d2", cat: "Sweet Endings", name: "Masala Chai", nameHi: "मसाला चाय", desc: "Ginger-cardamom tea, slow-brewed.", price: 70, veg: true },
];

/* =============================== THEME =============================== */
const DARK = {
  bg: "#17120E", surface: "#221A14", surfaceLight: "#2C2118", border: "#3A2C20",
  ember: "#C1442E", emberDark: "#8F2F20", turmeric: "#DFA23B", curry: "#8AA36E",
  text: "#F2E8D8", textMuted: "#A6947C",
};
const LIGHT = {
  bg: "#FBF6EC", surface: "#FFFFFF", surfaceLight: "#F3E9D6", border: "#E5D6BC",
  ember: "#C1442E", emberDark: "#8F2F20", turmeric: "#A9720F", curry: "#4E6B3B",
  text: "#241A14", textMuted: "#7A6A54",
};

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');
`;

/* =============================== TRANSLATIONS =============================== */
const T = {
  en: {
    kicker: "TANDOOR-FIRST INDIAN KITCHEN",
    navMenu: "Menu", navAbout: "About",
    heroSubtitle: "Order online, or scan the token on your table and enter your table number to order right where you're sitting.",
    tableBanner: (n) => `You're ordering from Table ${n}`,
    bestsellers: "🔥 Bestsellers",
    add: "Add",
    yourOrder: "Your order",
    emptyCart: "Your cart is empty. Add something from the menu.",
    total: "Total",
    dineIn: "Dine-in (table)",
    takeaway: "Takeaway",
    tableNumber: "Table number",
    yourName: "Your name",
    phoneNumber: "Phone number",
    placeOrder: "Place order",
    placing: "Placing order…",
    ourStory: "Our story",
    storyText: "Dhuaan began as a single coal tandoor in a Bandra by-lane. Every dish still passes through smoke and fire before it reaches the table — the name means \"smoke\" for a reason.",
    location: "Location", hours: "Hours", phone: "Phone", rating: "Rating",
    staffLink: "Restaurant staff — view live orders",
    ownerLink: "Owner / Manager login",
    orderToken: "ORDER TOKEN",
    sentToKitchen: "Sent to the kitchen",
    done: "Done",
    errTable: "Please enter your table number.",
    errTakeaway: "Please enter your name and phone number.",
    ordersTab: "Orders", qrTab: "QR Codes", summaryTab: "Summary",
    backToCustomer: "Back to customer view",
    refresh: "Refresh",
    staffDash: "Staff dashboard",
    noOrders: "No orders yet. They'll show up here as customers place them.",
    qrHelp: "Print one of these per table. Scanning it opens the menu with the table number already filled in.",
    copyLink: "Copy link", copied: "Copied!",
    totalOrders: "Total orders", totalRevenue: "Total revenue",
    topDishes: "Top dishes",
    ownerPanel: "Owner panel", enterPin: "Enter PIN to continue",
    wrongPin: "Incorrect PIN", unlock: "Unlock",
    revenueByCat: "Revenue by category", ordersByMode: "Dine-in vs takeaway",
    recentOrders: "Recent orders", sold: "sold",
    searchPlaceholder: "Search dishes…", noResults: "No dishes match your search.", searchResults: "Search results",
    navReviews: "Reviews", writeReview: "Write a review", yourRating: "Your rating", yourComment: "Your comment",
    submitReview: "Submit review", noReviews: "No reviews yet — be the first!", avgRating: "average from",
    reviewsWord: "reviews", reviewNamePh: "Your name", reviewCommentPh: "How was your experience?",
    newOrderAlert: "New order received!",
    trackOrder: "Track your order", trackOrderTitle: "Track order", enterOrderId: "Enter your order ID", findOrder: "Find order",
    orderNotFound: "No order found with that ID.", currentStatus: "Current status",
    staffPinTitle: "Staff dashboard",
    ownerTabAnalytics: "Analytics", ownerTabMenu: "Menu editor", ownerTabDetails: "Restaurant details",
    addDish: "Add new dish", dishNameEn: "Dish name (English)", dishNameHiLabel: "Dish name (Hindi)",
    description: "Description", price: "Price (₹)", category: "Category", vegLabel: "Veg", nonVegLabel: "Non-veg",
    delete: "Delete", saveChanges: "Save changes", savedMsg: "Saved!",
  },
  hi: {
    kicker: "तंदूर की आंच में पका असली स्वाद",
    navMenu: "मेन्यू", navAbout: "बारे में",
    heroSubtitle: "ऑनलाइन ऑर्डर करें, या अपनी टेबल पर लगा QR कोड स्कैन करें और टेबल नंबर डालकर वहीं से ऑर्डर करें।",
    tableBanner: (n) => `आप टेबल ${n} से ऑर्डर कर रहे हैं`,
    bestsellers: "🔥 सबसे पसंदीदा",
    add: "जोड़ें",
    yourOrder: "आपका ऑर्डर",
    emptyCart: "आपकी कार्ट खाली है। मेन्यू से कुछ जोड़ें।",
    total: "कुल",
    dineIn: "डाइन-इन (टेबल)",
    takeaway: "टेकअवे",
    tableNumber: "टेबल नंबर",
    yourName: "आपका नाम",
    phoneNumber: "फ़ोन नंबर",
    placeOrder: "ऑर्डर करें",
    placing: "ऑर्डर हो रहा है…",
    ourStory: "हमारी कहानी",
    storyText: "धुआं की शुरुआत बांद्रा की एक गली में एक कोयले के तंदूर से हुई थी। आज भी हर डिश आप तक पहुंचने से पहले धुएं और आंच से होकर गुज़रती है।",
    location: "स्थान", hours: "समय", phone: "फ़ोन", rating: "रेटिंग",
    staffLink: "रेस्टोरेंट स्टाफ — लाइव ऑर्डर देखें",
    ownerLink: "ओनर / मैनेजर लॉगिन",
    orderToken: "ऑर्डर टोकन",
    sentToKitchen: "किचन में भेज दिया गया",
    done: "हो गया",
    errTable: "कृपया अपना टेबल नंबर डालें।",
    errTakeaway: "कृपया अपना नाम और फ़ोन नंबर डालें।",
    ordersTab: "ऑर्डर", qrTab: "QR कोड", summaryTab: "सारांश",
    backToCustomer: "कस्टमर व्यू पर वापस जाएं",
    refresh: "रिफ्रेश करें",
    staffDash: "स्टाफ डैशबोर्ड",
    noOrders: "अभी तक कोई ऑर्डर नहीं है।",
    qrHelp: "हर टेबल के लिए एक QR कोड प्रिंट करें। स्कैन करते ही टेबल नंबर अपने आप भर जाएगा।",
    copyLink: "लिंक कॉपी करें", copied: "कॉपी हो गया!",
    totalOrders: "कुल ऑर्डर", totalRevenue: "कुल कमाई",
    topDishes: "सबसे ज़्यादा बिकने वाली डिशेज़",
    ownerPanel: "ओनर पैनल", enterPin: "आगे बढ़ने के लिए PIN डालें",
    wrongPin: "गलत PIN", unlock: "अनलॉक करें",
    revenueByCat: "श्रेणी अनुसार कमाई", ordersByMode: "डाइन-इन बनाम टेकअवे",
    recentOrders: "हाल के ऑर्डर", sold: "बिके",
    searchPlaceholder: "डिश खोजें…", noResults: "कोई डिश नहीं मिली।", searchResults: "खोज परिणाम",
    navReviews: "रिव्यू", writeReview: "रिव्यू लिखें", yourRating: "आपकी रेटिंग", yourComment: "आपकी राय",
    submitReview: "रिव्यू सबमिट करें", noReviews: "अभी तक कोई रिव्यू नहीं है — सबसे पहले आप लिखें!", avgRating: "औसत,",
    reviewsWord: "रिव्यू", reviewNamePh: "आपका नाम", reviewCommentPh: "आपका अनुभव कैसा रहा?",
    newOrderAlert: "नया ऑर्डर आया है!",
    trackOrder: "अपना ऑर्डर ट्रैक करें", trackOrderTitle: "ऑर्डर ट्रैक करें", enterOrderId: "अपनी ऑर्डर ID डालें", findOrder: "ऑर्डर खोजें",
    orderNotFound: "इस ID से कोई ऑर्डर नहीं मिला।", currentStatus: "मौजूदा स्थिति",
    staffPinTitle: "स्टाफ डैशबोर्ड",
    ownerTabAnalytics: "विश्लेषण", ownerTabMenu: "मेन्यू एडिटर", ownerTabDetails: "रेस्टोरेंट विवरण",
    addDish: "नई डिश जोड़ें", dishNameEn: "डिश का नाम (English)", dishNameHiLabel: "डिश का नाम (हिंदी)",
    description: "विवरण", price: "कीमत (₹)", category: "श्रेणी", vegLabel: "वेज", nonVegLabel: "नॉन-वेज",
    delete: "हटाएं", saveChanges: "बदलाव सेव करें", savedMsg: "सेव हो गया!",
  },
};

/* =============================== CONTEXTS =============================== */
const ThemeCtx = createContext();
const LangCtx = createContext();
const useThemeC = () => useContext(ThemeCtx);
const useLangC = () => useContext(LangCtx);

/* =============================== HELPERS =============================== */
const rupee = (n) => `₹${n.toLocaleString("en-IN")}`;

function VegDot({ veg, C }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 14, height: 14, border: `1.5px solid ${veg ? C.curry : C.ember}`,
      borderRadius: 3, flexShrink: 0,
    }} title={veg ? "Veg" : "Non-veg"}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: veg ? C.curry : C.ember }} />
    </span>
  );
}

async function readOrders() { return getOrders(); }
async function writeOrders(list) { return saveOrders(list); }
async function readReviews() { return getReviews(); }
async function writeReviews(list) { return saveReviews(list); }
async function readMenuConfig() { return getMenuConfig(); }
async function writeMenuConfig(config) { return saveMenuConfigRemote(config); }

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine"; osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(); osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

/* =============================== APP =============================== */
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
  const [placing, setPlacing] = useState(false);
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
        const m = menuItems.find((mm) => mm.name === i.name);
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
    [cart]
  );
  const cartCount = cartItems.reduce((a, i) => a + i.qty, 0);
  const cartTotal = cartItems.reduce((a, i) => a + i.qty * i.price, 0);

  const addItem = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const removeItem = (id) => setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] || 0) - 1) }));

  const canPlace = cartItems.length > 0 &&
    (orderMode === "dinein" ? tableNumber.trim().length > 0 : custName.trim().length > 0 && custPhone.trim().length >= 7);

  const placeOrder = async () => {
    if (!canPlace) { setError(orderMode === "dinein" ? t.errTable : t.errTakeaway); return; }
    setError(""); setPlacing(true);
    const order = {
      id: "DH" + Math.random().toString(36).slice(2, 6).toUpperCase() + Date.now().toString().slice(-4),
      mode: orderMode,
      table: orderMode === "dinein" ? tableNumber.trim() : null,
      name: orderMode === "takeaway" ? custName.trim() : null,
      phone: orderMode === "takeaway" ? custPhone.trim() : null,
      items: cartItems.map((i) => ({ name: i.name, cat: i.cat, qty: i.qty, price: i.price })),
      total: cartTotal, status: "received", placedAt: new Date().toISOString(),
    };
    const list = await readOrders();
    list.unshift(order);
    const ok = await writeOrders(list);
    if (!ok) console.error("Order could not be synced to shared storage, showing confirmation anyway:", order.id);
    setConfirmedOrder(order); setCart({}); setDrawerOpen(false); setPlacing(false);
  };

  const loadStaffOrders = async () => { setStaffLoading(true); setStaffOrders(await readOrders()); setStaffLoading(false); };
  useEffect(() => { if (staffView && staffUnlocked) loadStaffOrders(); }, [staffView, staffUnlocked]);
  useEffect(() => {
    if (!staffView || !staffUnlocked) return;
    const interval = setInterval(loadStaffOrders, 8000);
    return () => clearInterval(interval);
  }, [staffView, staffUnlocked]);

  const submitReview = async () => {
    if (!reviewName.trim() || !reviewComment.trim()) return;
    setReviewSubmitting(true);
    const review = { id: "RV" + Date.now(), name: reviewName.trim(), rating: reviewRating, comment: reviewComment.trim(), at: new Date().toISOString() };
    const list = await readReviews();
    list.unshift(review);
    await writeReviews(list);
    setReviews(list);
    setReviewName(""); setReviewComment(""); setReviewRating(5);
    setReviewSubmitting(false);
  };

  const findOrder = async () => {
    setTrackError(""); setTrackResult(null);
    const list = await readOrders();
    const found = list.find((o) => o.id.toLowerCase() === trackId.trim().toUpperCase().toLowerCase());
    if (found) setTrackResult(found); else setTrackError(t.orderNotFound);
  };
  const updateStatus = async (id, status) => {
    const list = staffOrders.map((o) => (o.id === id ? { ...o, status } : o));
    setStaffOrders(list); await writeOrders(list);
  };

  const openOwner = () => { setOwnerView(true); };

  const saveMenuConfig = async (newMenu, newInfo) => {
    setMenuItems(newMenu);
    setRestaurantInfo(newInfo);
    await writeMenuConfig({ menu: newMenu, restaurant: newInfo });
  };

  useEffect(() => {
    if (!ownerView || !ownerUnlocked) return;
    const fetchNow = async () => setOwnerOrders(await readOrders());
    fetchNow();
    const interval = setInterval(fetchNow, 10000);
    return () => clearInterval(interval);
  }, [ownerView, ownerUnlocked]);

  const dishName = (item) => (lang === "hi" ? item.nameHi || item.name : item.name);
  const catLabel = (en) => { const c = CATEGORIES.find((x) => x.en === en); return c ? (lang === "hi" ? c.hi : c.en) : en; };
  const filteredMenu = menuItems.filter((m) => m.cat === activeCat);
  const bestsellers = menuItems.filter((m) => bestsellerIds.includes(m.id));
  const searchResults = searchQuery.trim()
    ? menuItems.filter((m) => (m.name + " " + (m.nameHi || "") + " " + m.desc).toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : [];
  const avgReviewRating = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <ThemeCtx.Provider value={{ C, mode, setMode }}>
    <LangCtx.Provider value={{ lang, setLang, t }}>
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "'Inter', sans-serif", transition: "background .2s,color .2s" }}>
      <style>{FONT_IMPORT}{`
        * { box-sizing: border-box; }
        .disp { font-family: 'Fraunces', serif; }
        .mono { font-family: 'Space Mono', monospace; }
        button { font-family: inherit; cursor: pointer; }
        input { font-family: inherit; }
      `}</style>

      {ownerView ? (
        ownerUnlocked
          ? <OwnerPanel orders={ownerOrders} onExit={() => { setOwnerView(false); setOwnerUnlocked(false); }} onRefresh={async () => setOwnerOrders(await readOrders())} menuItems={menuItems} restaurantInfo={restaurantInfo} onSaveMenuConfig={saveMenuConfig} />
          : <PinLock expectedPin={OWNER_PIN} title={T[lang].ownerPanel} onSuccess={() => setOwnerUnlocked(true)} onExit={() => setOwnerView(false)} />
      ) : staffView ? (
        staffUnlocked
          ? <StaffView orders={staffOrders} loading={staffLoading} onRefresh={loadStaffOrders} onUpdateStatus={updateStatus} onExit={() => { setStaffView(false); setStaffUnlocked(false); }} baseUrl={baseUrl} />
          : <PinLock expectedPin={STAFF_PIN} title={T[lang].staffPinTitle} onSuccess={() => setStaffUnlocked(true)} onExit={() => setStaffView(false)} />
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
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: 16, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <VegDot veg={item.veg} C={C} />
                          <span className="disp" style={{ fontSize: 17, fontWeight: 600 }}>{dishName(item)}</span>
                        </div>
                        <p style={{ color: C.textMuted, fontSize: 13, margin: "0 0 10px", lineHeight: 1.4 }}>{item.desc}</p>
                        <span className="mono" style={{ color: C.turmeric, fontSize: 14 }}>{rupee(item.price)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", alignSelf: "center" }}>
                        {cart[item.id] ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.surfaceLight, borderRadius: 999, padding: "4px 6px", border: `1px solid ${C.border}` }}>
                            <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", color: C.text, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={14} /></button>
                            <span className="mono" style={{ fontSize: 13, minWidth: 14, textAlign: "center" }}>{cart[item.id]}</span>
                            <button onClick={() => addItem(item.id)} style={{ background: "none", border: "none", color: C.text, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={14} /></button>
                          </div>
                        ) : (
                          <button onClick={() => addItem(item.id)} style={{ background: "transparent", border: `1px solid ${C.turmeric}`, color: C.turmeric, borderRadius: 999, padding: "8px 16px", fontSize: 13, fontWeight: 700 }}>{t.add}</button>
                        )}
                      </div>
                    </div>
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
                        <div key={item.id} style={{ minWidth: 180, background: `linear-gradient(160deg, ${C.surfaceLight}, ${C.surface})`, border: `1px solid ${C.turmeric}55`, borderRadius: 14, padding: 14, flexShrink: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <VegDot veg={item.veg} C={C} />
                            <span className="disp" style={{ fontSize: 14, fontWeight: 600 }}>{dishName(item)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                            <span className="mono" style={{ fontSize: 13, color: C.turmeric }}>{rupee(item.price)}</span>
                            <button onClick={() => addItem(item.id)} style={{ background: "transparent", border: `1px solid ${C.turmeric}`, color: C.turmeric, borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 700 }}>{t.add}</button>
                          </div>
                        </div>
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
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: 16, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          <VegDot veg={item.veg} C={C} />
                          <span className="disp" style={{ fontSize: 17, fontWeight: 600 }}>{dishName(item)}</span>
                          {bestsellerIds.includes(item.id) && <Flame size={14} color={C.ember} title="Bestseller" />}
                        </div>
                        <p style={{ color: C.textMuted, fontSize: 13, margin: "0 0 10px", lineHeight: 1.4 }}>{item.desc}</p>
                        <span className="mono" style={{ color: C.turmeric, fontSize: 14 }}>{rupee(item.price)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", alignSelf: "center" }}>
                        {cart[item.id] ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.surfaceLight, borderRadius: 999, padding: "4px 6px", border: `1px solid ${C.border}` }}>
                            <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", color: C.text, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={14} /></button>
                            <span className="mono" style={{ fontSize: 13, minWidth: 14, textAlign: "center" }}>{cart[item.id]}</span>
                            <button onClick={() => addItem(item.id)} style={{ background: "none", border: "none", color: C.text, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={14} /></button>
                          </div>
                        ) : (
                          <button onClick={() => addItem(item.id)} style={{ background: "transparent", border: `1px solid ${C.turmeric}`, color: C.turmeric, borderRadius: 999, padding: "8px 16px", fontSize: 13, fontWeight: 700 }}>{t.add}</button>
                        )}
                      </div>
                    </div>
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

                    <button onClick={placeOrder} disabled={placing} style={{ marginTop: "auto", width: "100%", padding: "14px", borderRadius: 10, border: "none", background: C.ember, color: "#fff", fontWeight: 700, fontSize: 15, opacity: placing ? 0.7 : 1 }}>
                      {placing ? t.placing : `${t.placeOrder} · ${rupee(cartTotal)}`}
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

function InfoTile({ icon, label, value, C }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 2, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 14 }}>{value}</div>
    </div>
  );
}

/* =============================== STAFF VIEW =============================== */
function StaffView({ orders, loading, onRefresh, onUpdateStatus, onExit, baseUrl }) {
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
      <style>{FONT_IMPORT}</style>

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
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`} alt={`QR ${n}`} style={{ width: "100%", borderRadius: 8, background: "#fff" }} />
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

/* =============================== PIN LOCK =============================== */
function PinLock({ expectedPin, title, onSuccess, onExit }) {
  const { C } = useThemeC();
  const { t } = useLangC();
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);

  const submit = () => {
    if (pin === expectedPin) onSuccess();
    else { setErr(true); setPin(""); setTimeout(() => setErr(false), 1200); }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Inter', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <div style={{ width: "min(320px,100%)", textAlign: "center" }}>
        <Lock size={28} color={C.turmeric} />
        <h2 className="disp" style={{ fontSize: 22, margin: "14px 0 6px" }}>{title}</h2>
        <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 20 }}>{t.enterPin}</p>
        <input
          type="password" inputMode="numeric" value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          style={{ width: "100%", textAlign: "center", letterSpacing: 8, fontSize: 20, padding: "12px", borderRadius: 8, border: `1px solid ${err ? C.ember : C.border}`, background: C.surface, color: C.text, marginBottom: 10 }}
          autoFocus
        />
        {err && <p style={{ color: C.ember, fontSize: 12, marginBottom: 10 }}>{t.wrongPin}</p>}
        <button onClick={submit} style={{ width: "100%", padding: "12px", borderRadius: 8, border: "none", background: C.ember, color: "#fff", fontWeight: 700, marginBottom: 10 }}>{t.unlock}</button>
        <button onClick={onExit} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 12 }}>{t.backToCustomer}</button>
      </div>
    </div>
  );
}

/* =============================== OWNER PANEL =============================== */
function OwnerPanel({ orders, onExit, onRefresh, menuItems, restaurantInfo, onSaveMenuConfig }) {
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
      <style>{FONT_IMPORT}</style>
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
