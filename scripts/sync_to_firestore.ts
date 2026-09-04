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

  const hiddenIds = [
    "prod-cedric-grolet",
    "prod-san-sebastian-cheesecake-dilim",
    "prod-san-sebastian-cheesecake-butun",
    "prod-limonlu-cheesecake-dilim",
    "prod-limonlu-cheesecake-butun",
    "prod-lotuslu-cheesecake-dilim",
    "prod-lotuslu-cheesecake-butun",
    "prod-noa-tatli-tuzlu-ikili",
    "prod-noa-tatli-ikili",
    "prod-noa-tuzlu-ikili",
    "prod-noa-roll-kup-ikili",
  ];

  console.log("\nChecking hidden products in Firestore:");
  for (const id of hiddenIds) {
    const p = products.find((x) => x.id === id);
    console.log(`- ${id}: is_available=${p?.is_available}, is_active=${p?.is_active}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Sync error:", err);
  process.exit(1);
});
