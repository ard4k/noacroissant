import { seedAllDataToFirestore, isFirebaseConfigured, getAllProductsFromFirestore } from "../lib/firebase/firestore";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_TABLES, INITIAL_SETTINGS } from "../lib/seedData";

async function main() {
  console.log("Checking Firebase config...");
  console.log("isFirebaseConfigured:", isFirebaseConfigured);
  if (!isFirebaseConfigured) {
    console.error("Firebase is not configured! Check .env.local");
    process.exit(1);
  }

  console.log(`Seeding ${INITIAL_PRODUCTS.length} products to Firestore...`);
  const res = await seedAllDataToFirestore({
    categories: INITIAL_CATEGORIES,
    products: INITIAL_PRODUCTS,
    tables: INITIAL_TABLES,
    settings: INITIAL_SETTINGS,
  });

  console.log("Seed result:", res);

  // Verify
  console.log("Verifying Firestore data...");
  const products = await getAllProductsFromFirestore();
  console.log("Total products in Firestore:", products.length);

  const mini = products.find((p) => p.slug === "mini-kruvasan");
  console.log("Mini Kruvasan in Firestore:", mini?.name, "Price:", mini?.base_price);

  const ikili = products.find((p) => p.slug === "noa-tatli-ikili");
  console.log("Tatli Ikili in Firestore:", ikili?.name, "Price:", ikili?.base_price);

  const painSuisse = products.find((p) => p.slug === "pain-suisse-hindi-fume");
  console.log("Pain Suisse in Firestore:", painSuisse?.name, "Price:", painSuisse?.base_price);

  const cedric = products.find((p) => p.slug === "cedric-grolet");
  console.log("Cedric Grolet in Firestore:", cedric?.name, "Price:", cedric?.base_price);

  process.exit(0);
}

main().catch((err) => {
  console.error("Sync error:", err);
  process.exit(1);
});
