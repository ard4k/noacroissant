import { NextRequest, NextResponse } from "next/server";
import { noaStore } from "@/lib/store";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Sipariş takip kodu bulunamadı." },
      { status: 400 }
    );
  }

  // 1. Try Firestore first (primary source of truth for serverless)
  let order = null;
  try {
    const { getOrderByTrackingTokenFromFirestore, isFirebaseConfigured } = await import("@/lib/firebase/firestore");
    if (isFirebaseConfigured) {
      const firestoreOrder = await getOrderByTrackingTokenFromFirestore(token);
      if (firestoreOrder) {
        order = firestoreOrder;
        // Hydrate in-memory store for local dev consistency
        noaStore.hydrateOrder(firestoreOrder);
      }
    }
  } catch (e) {
    console.warn("Firestore order tracking lookup warning:", e);
  }

  // 2. Fallback to in-memory store (works in local dev with single process)
  if (!order) {
    order = noaStore.getOrderByTrackingToken(token);
  }

  if (!order) {
    return NextResponse.json(
      { error: "Geçersiz takip kodu veya sipariş bulunamadı." },
      { status: 404 }
    );
  }

  // Return safe customer order payload
  return NextResponse.json({
    order: {
      id: order.id,
      order_number: order.order_number,
      table_number: order.table_number,
      table_label: order.table_label,
      status: order.status,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      subtotal: order.subtotal,
      total: order.total,
      general_note: order.general_note,
      created_at: order.created_at,
      cancelled_reason: order.cancelled_reason,
      items: order.items.map((i) => ({
        id: i.id,
        product_name: i.product_name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total_price: i.total_price,
        item_note: i.item_note,
        is_complimentary: i.is_complimentary,
        options: i.options,
      })),
      status_history: order.status_history || [],
    },
  });
}

