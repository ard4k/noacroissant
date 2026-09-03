import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// ---------------------------------------------------------------------------
// SECURITY: Firebase credentials MUST come from environment variables.
// Never hardcode API keys, project IDs, or app IDs here.
// Configure these in Vercel Dashboard → Project → Environment Variables.
// ---------------------------------------------------------------------------
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Detect placeholder / missing values
const isPlaceholder = (val: string) =>
  !val ||
  val.includes("AIzaSy...") ||
  val.includes("XXXXXXXXXX") ||
  val.includes("1234567890") ||
  val === "";

export const isFirebaseConfigured = Boolean(
  !isPlaceholder(firebaseConfig.apiKey) &&
  !isPlaceholder(firebaseConfig.projectId) &&
  !isPlaceholder(firebaseConfig.appId)
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.warn("Firebase initialization warning:", error);
  }
} else {
  console.warn(
    "[NOA] Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* environment variables. " +
    "The app will run in local-only mode without Firestore persistence."
  );
}

export { app, db, auth };
