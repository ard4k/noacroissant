import { NextRequest, NextResponse } from "next/server";
import { noaStore } from "@/lib/store";
import { isRequestKitchenAuthenticated, validateCsrfOrigin, isValidStatusTransition } from "@/lib/adminAuth";
import { OrderStatus, PaymentStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_STATUSES: OrderStatus[] = ["received", "preparing", "ready", "served", "cancelled"];
const VALID_PAYMENT_STATUSES: PaymentStatus[] = ["unpaid", "paid"];

export async function POST(req: NextRequest) {
  // 1. Authentication check
  if (!isRequestKitchenAuthenticated(req)) {
    return NextResponse.json(
      { success: false, error: "Yetkisiz erişim: Personel oturumu gereklidir." },
      { status: 401 }
    );
  }

  // 2. CSRF check
  if (!validateCsrfOrigin(req)) {
    return NextResponse.json(
      { success: false, error: "CSRF doğrulaması başarısız oldu." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { order_id, status, payment_status, cancelled_reason, note, staff_name } = body;

    if (!order_id || typeof order_id !== "string") {
      return NextResponse.json({ error: "Geçerli bir Sipariş ID gereklidir." }, { status: 400 });
    }

    if (status && !VALID_STATUSES.includes(status as OrderStatus)) {
      return NextResponse.json({ error: "Geçersiz sipariş durumu." }, { status: 400 });
    }

    if (payment_status && !VALID_PAYMENT_STATUSES.includes(payment_status as PaymentStatus)) {
      return NextResponse.json({ error: "Geçersiz ödeme durumu." }, { status: 400 });
    }

    // Hydrate from Firestore first so the in-memory store has the latest state
    try {
      const { getOrderByIdFromFirestore, isFirebaseConfigured } = await import("@/lib/firebase/firestore");
      if (isFirebaseConfigured) {
        const firestoreOrder = await getOrderByIdFromFirestore(order_id);
        if (firestoreOrder) {
          noaStore.hydrateOrder(firestoreOrder);
        }
      }
    } catch (e) {
      console.warn("Firestore order hydration warning:", e);
    }

    const existingOrder = noaStore.getOrderById(order_id);
    if (!existingOrder) {
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }

    // 3. Validate state transitions
    if (status && status !== existingOrder.status) {
      if (!isValidStatusTransition(existingOrder.status, status as OrderStatus)) {
        return NextResponse.json(
          {
            error: `Geçersiz durum geçişi: '${existingOrder.status}' durumundan '${status}' durumuna geçilemez.`,
          },
          { status: 400 }
        );
      }
    }

    let currentStatus = status;

    if (payment_status) {
      noaStore.updatePaymentStatus(order_id, payment_status);
      if (payment_status === "paid" && existingOrder.status === "received" && !status) {
        currentStatus = "preparing";
        noaStore.updateOrderStatus(order_id, "preparing", "Ödeme onaylandı, hazırlanıyor", undefined, staff_name || "Yetkili");
      } else if (payment_status === "unpaid" && existingOrder.status !== "received" && !status) {
        currentStatus = "received";
        noaStore.updateOrderStatus(order_id, "received", "Ödeme iptal edildi, kasada ödeme bekleniyor", undefined, staff_name || "Yetkili");
      }
    }

    if (currentStatus) {
      noaStore.updateOrderStatus(order_id, currentStatus, note, cancelled_reason, staff_name || "Personel");
    }

    const updated = noaStore.getOrderById(order_id);

    // Persist to Firestore
    try {
      const { saveOrderToFirestore, updateOrderStatusInFirestore, isFirebaseConfigured } = await import("@/lib/firebase/firestore");
      if (isFirebaseConfigured && updated) {
        await saveOrderToFirestore(updated);
        await updateOrderStatusInFirestore(order_id, updated.status, updated.payment_status, staff_name || "Personel");
      }
    } catch (e) {
      console.error("Firestore order status update failed:", e);
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Güncelleme başarısız." }, { status: 400 });
  }
}


