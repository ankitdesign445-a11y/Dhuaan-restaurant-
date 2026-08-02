import { createContext, useContext } from "react";

/* =============================== CONFIG — DEFAULT VALUES (owner can also edit these live from the Owner Panel) =============================== */
export const TOTAL_TABLES = 12;      // how many tables you have (for QR generation)
export const OWNER_PIN = "1234";     // owner/manager panel PIN — change this before real use
export const STAFF_PIN = "0000";     // staff dashboard PIN — change this before real use

export const DEFAULT_RESTAURANT = {
  name: "Dhuaan",
  tagline: "Fire-cooked food, from our tandoor to your table",
  address: "14 Cinnamon Lane, Bandra West, Mumbai",
  hours: "12:00 PM – 11:30 PM · Everyday",
  phone: "+91 98765 43210",
  rating: 4.6,
};

export const CATEGORIES = [
  { en: "Shuru'aat", hi: "शुरुआत" },
  { en: "Tandoor", hi: "तंदूर" },
  { en: "Mains", hi: "मुख्य भोजन" },
  { en: "Biryani & Rice", hi: "बिरयानी और चावल" },
  { en: "Breads", hi: "रोटियां" },
  { en: "Sweet Endings", hi: "मिठाई" },
];

export const DEFAULT_MENU = [
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
export const DARK = {
  bg: "#17120E", surface: "#221A14", surfaceLight: "#2C2118", border: "#3A2C20",
  ember: "#C1442E", emberDark: "#8F2F20", turmeric: "#DFA23B", curry: "#8AA36E",
  text: "#F2E8D8", textMuted: "#A6947C",
};
export const LIGHT = {
  bg: "#FBF6EC", surface: "#FFFFFF", surfaceLight: "#F3E9D6", border: "#E5D6BC",
  ember: "#C1442E", emberDark: "#8F2F20", turmeric: "#A9720F", curry: "#4E6B3B",
  text: "#241A14", textMuted: "#7A6A54",
};

/* =============================== TRANSLATIONS =============================== */
export const T = {
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
export const ThemeCtx = createContext();
export const LangCtx = createContext();
export const useThemeC = () => useContext(ThemeCtx);
export const useLangC = () => useContext(LangCtx);

/* =============================== HELPERS =============================== */
export const rupee = (n) => `₹${n.toLocaleString("en-IN")}`;

export function playBeep() {
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
