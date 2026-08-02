// =============================================================
// FIREBASE SETUP — paste your own project's config below.
// See README.md for the full setup steps.
// =============================================================
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, doc, setDoc, getDoc, getDocs, query, orderBy,
} from "firebase/firestore";

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

const ordersCol = collection(db, "orders");
const reviewsCol = collection(db, "reviews");
const configCol = collection(db, "config");

/* ---------------------------- Orders ----------------------------
   Each order is its own document (fast to write — no need to read
   the whole order history first). Reading fetches every order doc,
   newest first. */
export async function saveOrder(order) {
  try { await setDoc(doc(ordersCol, order.id), order); return true; }
  catch (e) { console.error("saveOrder failed:", e); return false; }
}

export async function getOrders() {
  try {
    const snap = await getDocs(query(ordersCol, orderBy("placedAt", "desc")));
    return snap.docs.map((d) => d.data());
  } catch (e) { console.error("getOrders failed:", e); return []; }
}

export async function updateOrderStatus(orderId, status) {
  try { await setDoc(doc(ordersCol, orderId), { status }, { merge: true }); return true; }
  catch (e) { console.error("updateOrderStatus failed:", e); return false; }
}

/* ---------------------------- Reviews ---------------------------- */
export async function saveReview(review) {
  try { await setDoc(doc(reviewsCol, review.id), review); return true; }
  catch (e) { console.error("saveReview failed:", e); return false; }
}

export async function getReviews() {
  try {
    const snap = await getDocs(query(reviewsCol, orderBy("at", "desc")));
    return snap.docs.map((d) => d.data());
  } catch (e) { console.error("getReviews failed:", e); return []; }
}

/* ---------------------------- Menu / restaurant config ----------------------------
   This one stays a single document — it changes rarely, so there's
   no read-modify-write-a-growing-list problem here. */
export async function getMenuConfig() {
  try {
    const snap = await getDoc(doc(configCol, "menu"));
    return snap.exists() ? snap.data().value : null;
  } catch (e) { console.error("getMenuConfig failed:", e); return null; }
}

export async function saveMenuConfig(config) {
  try { await setDoc(doc(configCol, "menu"), { value: config }); return true; }
  catch (e) { console.error("saveMenuConfig failed:", e); return false; }
}
