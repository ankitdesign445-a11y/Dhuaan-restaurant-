// =============================================================
// FIREBASE SETUP — connected to the "dhuaan-restaurant" Firebase project.
// Firestore collections used: orders, reviews, config.
// =============================================================
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, doc, setDoc, getDoc, getDocs, query, orderBy, onSnapshot,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCE8bvMxzNnlxMyjZ7Co9BiRr1NSh2FDXg",
  authDomain: "dhuaan-restaurant.firebaseapp.com",
  projectId: "dhuaan-restaurant",
  storageBucket: "dhuaan-restaurant.firebasestorage.app",
  messagingSenderId: "586919923085",
  appId: "1:586919923085:web:9a580953b6bf6ed70b81c4",
  measurementId: "G-LGGQN74HBE",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ordersCol = collection(db, "orders");
const reviewsCol = collection(db, "reviews");
const configCol = collection(db, "config");

/* ---------------------------- Orders ----------------------------
   Each order is its own document (fast to write — no need to read
   the whole order history first).

   subscribeOrders() is the important one for the cross-device sync
   problem: it opens a live Firestore connection. Any phone that
   writes a new order (or updates a status) pushes that change to
   every other phone listening, instantly — no refresh needed. */
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

/** Single-document lookup by order ID — used by "Track your order" so a
 *  customer search doesn't have to download every order just to find one. */
export async function getOrderById(orderId) {
  try {
    const snap = await getDoc(doc(ordersCol, orderId));
    return snap.exists() ? snap.data() : null;
  } catch (e) { console.error("getOrderById failed:", e); return null; }
}

/** Real-time subscription to a single order. Used to keep the customer's
 *  "Track your order" view live once they've found their order — if staff
 *  changes the status on another phone, this pushes the update instantly.
 *  Always call the returned unsubscribe function when done (e.g. when the
 *  tracking modal closes) to avoid leaving the connection open. */
export function subscribeToOrder(orderId, onChange, onError) {
  return onSnapshot(
    doc(ordersCol, orderId),
    (snap) => onChange(snap.exists() ? snap.data() : null),
    (err) => {
      console.error("subscribeToOrder failed:", err);
      if (onError) onError(err);
    }
  );
}

/** Real-time subscription. Call with a callback that receives the full,
 *  up-to-date orders array every time anything changes. Returns an
 *  `unsubscribe` function — always call it when the component using
 *  it unmounts (in a useEffect cleanup), or the connection stays open
 *  forever and leaks. */
export function subscribeOrders(onChange, onError) {
  const q = query(ordersCol, orderBy("placedAt", "desc"));
  return onSnapshot(
    q,
    (snap) => onChange(snap.docs.map((d) => d.data())),
    (err) => {
      console.error("subscribeOrders failed:", err);
      if (onError) onError(err);
    }
  );
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
