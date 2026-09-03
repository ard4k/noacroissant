import { NextRequest, NextResponse } from "next/server";
import { noaStore } from "@/lib/store";
import { isRequestAdminAuthenticated, validateCsrfOrigin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { getAllProductsFromFirestore, getSettingsFromFirestore, isFirebaseConfigured } = await import("@/lib/firebase/firestore");
    if (isFirebaseConfigured) {
      const localProducts = noaStore.getProducts();
      const firestoreProducts = await getAllProductsFromFirestore();

      if (firestoreProducts && firestoreProducts.length > 0) {
        if (localProducts.length === 0) {
          // Cold start (serverless) — no local data, use Firestore as source of truth
          noaStore.hydrateProducts(firestoreProducts);
        } else {
          // Local store already has data (from file or previous update).
          // Only sync fields that DON'T represent admin overrides (e.g. new products added elsewhere).
          // Do NOT overwrite is_available — those are admin-controlled locally.
          const localIds = new Set(localProducts.map((p) => p.id));
          const newFromFirestore = firestoreProducts.filter((p) => !localIds.has(p.id));
          if (newFromFirestore.length > 0) {
            noaStore.hydrateProducts(newFromFirestore);
          }
        }
      }

      const firestoreSettings = await getSettingsFromFirestore();
      if (firestoreSettings) {
        noaStore.updateSettings(firestoreSettings);
      }
    }
  } catch (e) {
    console.warn("Firestore products/settings sync warning:", e);
  }

  return NextResponse.json(
    {
      success: true,
      products: noaStore.getProducts(),
      categories: noaStore.getCategories(),
      tables: noaStore.getTables(),
      settings: noaStore.getSettings(),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  // Handler-level authorization: Admin only
  if (!isRequestAdminAuthenticated(req)) {
    return NextResponse.json(
      { success: false, error: "Yetkisiz erişim: Bu işlem yönetici yetkisi gerektirir." },
      { status: 401 }
    );
  }

  if (!validateCsrfOrigin(req)) {
    return NextResponse.json(
      { success: false, error: "CSRF doğrulaması başarısız oldu." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { action, product, products, id } = body;

    if (action === "update" && product && product.id) {
      const updated = noaStore.updateProduct(product);
      try {
        const { saveProductToFirestore } = await import("@/lib/firebase/firestore");
        await saveProductToFirestore(updated);
      } catch (e) { console.warn("Firestore product update warning:", e); }
      return NextResponse.json({ success: true, product: updated });
    }

    if (action === "sync_all") {
      const productsToSync = products && Array.isArray(products) ? products : noaStore.getProducts();
      try {
        const { saveProductToFirestore } = await import("@/lib/firebase/firestore");
        for (const p of productsToSync) {
          noaStore.updateProduct(p);
          await saveProductToFirestore(p);
        }
        return NextResponse.json({ success: true, count: productsToSync.length });
      } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Senkronizasyon başarısız" }, { status: 500 });
      }
    }

    if (action === "create" && product) {
      const created = noaStore.addProduct(product);
      try {
        const { saveProductToFirestore } = await import("@/lib/firebase/firestore");
        await saveProductToFirestore(created);
      } catch (e) { console.warn("Firestore product create warning:", e); }
      return NextResponse.json({ success: true, product: created });
    }

    if (action === "delete" && id) {
      noaStore.deleteProduct(id);
      try {
        const { deleteProductFromFirestore } = await import("@/lib/firebase/firestore");
        await deleteProductFromFirestore(id);
      } catch (e) { console.warn("Firestore product delete warning:", e); }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "İşlem başarısız" }, { status: 400 });
  }
}

