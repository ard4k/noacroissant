import { isFirebaseConfigured, getAllProductsFromFirestore } from "../lib/firebase/firestore";

async function check() {
  console.log("isFirebaseConfigured:", isFirebaseConfigured);
  if (!isFirebaseConfigured) return;
  try {
    const products = await getAllProductsFromFirestore();
    console.log("Firestore products count:", products.length);
    if (products.length > 0) {
      const sample = products.find(p => p.slug === "mini-kruvasan" || p.slug === "yesil-lezzet");
      console.log("Sample product from Firestore:", sample?.name, sample?.base_price);
    }
  } catch (err) {
    console.error("Error querying Firestore:", err);
  }
}

check();
