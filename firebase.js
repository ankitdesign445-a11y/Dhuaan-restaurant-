// =============================================================
// FIREBASE SETUP — paste your own project's config below.
//
// How to get this:
// 1. Go to https://console.firebase.google.com
// 2. Create a project (skip Google Analytics, not needed)
// 3. Click the "</>" (web) icon to register a web app
// 4. Copy the firebaseConfig object it gives you and paste it here
// 5. In the left menu, go to Build → Firestore Database → Create database
//    → Start in test mode → pick a location close to you (e.g. asia-south1)
// =============================================================
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// All restaurant data lives in one Firestore collection called "dhuaan",
// with one document per data type (orders, reviews, menu). This keeps
// things simple and cheap to read/write.
const COLLECTION = "dhuaan";

async function readDoc(key) {
  try {
    const snap = await getDoc(doc(db, COLLECTION, key));
    return snap.exists() ? snap.data().value : null;
  } catch (e) {
    console.error(`Firestore read failed for "${key}":`, e);
    return null;
  }
}

async function writeDoc(key, value) {
  try {
    await setDoc(doc(db, COLLECTION, key), { value, updatedAt: new Date().toISOString() });
    return true;
  } catch (e) {
    console.error(`Firestore write failed for "${key}":`, e);
    return false;
  }
}

/* ---------------------------- Orders ---------------------------- */
export async function getOrders() {
  const v = await readDoc("orders-list");
  return v ? JSON.parse(v) : [];
}
export async function saveOrders(list) {
  return writeDoc("orders-list", JSON.stringify(list));
}

/* ---------------------------- Reviews ---------------------------- */
export async function getReviews() {
  const v = await readDoc("reviews-list");
  return v ? JSON.parse(v) : [];
}
export async function saveReviews(list) {
  return writeDoc("reviews-list", JSON.stringify(list));
}

/* ---------------------------- Menu / restaurant config ---------------------------- */
export async function getMenuConfig() {
  const v = await readDoc("menu-config");
  return v ? JSON.parse(v) : null;
}
export async function saveMenuConfig(config) {
  return writeDoc("menu-config", JSON.stringify(config));
}
