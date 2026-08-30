import { NextRequest, NextResponse } from "next/server";
import { noaStore } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, status, payment_status, cancelled_reason, note, staff_name } = body;

    if (!order_id) {
      return NextResponse.json({ error: "Sipariş ID gereklidir." }, { status: 400 });
    }

    let currentStatus = status;

    if (payment_status) {
      noaStore.updatePaymentStatus(order_id, payment_status);
      const existing = noaStore.getOrderById(order_id);
      if (payment_status === "paid" && existing && existing.status === "received" && !status) {
        currentStatus = "preparing";
        noaStore.updateOrderStatus(order_id, "preparing", "Ödeme onaylandı, hazırlanıyor", undefined, staff_name || "Yönetici");
      } else if (payment_status === "unpaid" && existing && existing.status !== "received" && !status) {
        currentStatus = "received";
        noaStore.updateOrderStatus(order_id, "received", "Ödeme iptal edildi, kasada ödeme bekleniyor", undefined, staff_name || "Yönetici");
      }
    }

    if (currentStatus) {
      noaStore.updateOrderStatus(order_id, currentStatus, note, cancelled_reason, staff_name);
    }

    const updated = noaStore.getOrderById(order_id);

    // Sync with Firestore asynchronously
    try {
      const { updateOrderStatusInFirestore } = await import("@/lib/firebase/firestore");
      if (updated) {
        updateOrderStatusInFirestore(order_id, updated.status, updated.payment_status, staff_name).catch(() => {});
      }
    } catch (e) {}

    return NextResponse.json({ success: true, order: updated });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Güncelleme başarısız." }, { status: 400 });
  }
}
