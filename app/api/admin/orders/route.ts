import { NextRequest, NextResponse } from "next/server";
import { noaStore } from "@/lib/store";
import { isRequestKitchenAuthenticated, isRequestAdminAuthenticated, validateCsrfOrigin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Handler-level authentication: Requires Admin or Kitchen session
  if (!isRequestKitchenAuthenticated(req)) {
    return NextResponse.json(
      { success: false, error: "Yetkisiz erişim: Personel oturumu gereklidir." },
      { status: 401 }
    );
  }

  // 1. Try Firestore first (primary source of truth for serverless)
  let orders: import("@/lib/types").OrderRecord[] = [];
  try {
    const { getAllOrdersFromFirestore, isFirebaseConfigured } = await import("@/lib/firebase/firestore");
    if (isFirebaseConfigured) {
      const firestoreOrders = await getAllOrdersFromFirestore();
      if (firestoreOrders && Array.isArray(firestoreOrders) && firestoreOrders.length > 0) {
        orders = firestoreOrders;
        noaStore.hydrateOrders(firestoreOrders);
      }
    }
  } catch (e) {
    console.warn("Firestore admin orders sync warning:", e);
  }

  // 2. Fallback to in-memory store if Firestore returned nothing
  if (orders.length === 0) {
    orders = noaStore.getOrders();
  }

  return NextResponse.json(
    {
      success: true,
      orders,
      tables: noaStore.getTables(),
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
    if (body.action === "clear_all") {
      try {
        const { clearAllOrdersFromFirestore } = await import("@/lib/firebase/firestore");
        await clearAllOrdersFromFirestore();
      } catch (e) {
        console.warn("Firestore clear orders error:", e);
      }
      noaStore.clearOrders();
      return NextResponse.json({
        success: true,
        message: "Tüm siparişler başarıyla temizlendi.",
        orders: [],
      });
    }
    return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "İşlem gerçekleştirilemedi" }, { status: 500 });
  }
}


