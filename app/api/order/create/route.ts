import { NextRequest, NextResponse } from "next/server";
import { noaStore } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { table_token, items, payment_method, general_note, idempotency_key } = body;

    const resolvedTableToken = table_token || "self_service";

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Sipariş listesinde en az bir ürün bulunmalıdır." },
        { status: 400 }
      );
    }

    if (!payment_method || !["credit_card", "cash", "table", "cashier"].includes(payment_method)) {
      return NextResponse.json(
        { error: "Lütfen geçerli bir ödeme yöntemi seçiniz (Kredi Kartı veya Nakit)." },
        { status: 400 }
      );
    }

    // Call tamper-proof store calculation
    const result = noaStore.createOrder({
      table_token: resolvedTableToken,
      items,
      payment_method,
      general_note,
      idempotency_key,
    });

    // Save to Firestore if configured (async without blocking response)
    try {
      const { saveOrderToFirestore } = await import("@/lib/firebase/firestore");
      saveOrderToFirestore(result.order).catch((err) =>
        console.warn("Firestore background save warning:", err)
      );
    } catch (e) {
      // ignore
    }

    return NextResponse.json({
      success: true,
      order: {
        id: result.order.id,
        order_number: result.order.order_number,
        table_number: result.order.table_number,
        table_label: result.order.table_label,
        total: result.order.total,
        status: result.order.status,
        payment_method: result.order.payment_method,
        created_at: result.order.created_at,
      },
      tracking_token: result.tracking_token,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Order creation error:", err);
    return NextResponse.json(
      { error: err.message || "Sipariş oluşturulurken bir hata meydana geldi." },
      { status: 400 }
    );
  }
}
