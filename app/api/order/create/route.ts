import { NextRequest, NextResponse } from "next/server";
import { noaStore } from "@/lib/store";

export const dynamic = "force-dynamic";

function sanitizeString(input: unknown, maxLength: number): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ""); // Basic HTML tag strip
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { table_token, items, payment_method, general_note, idempotency_key, customer_phone, language } = body;

    // 1. Validate Items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Sipariş listesinde en az bir ürün bulunmalıdır." },
        { status: 400 }
      );
    }

    if (items.length > 50) {
      return NextResponse.json(
        { error: "Bir siparişte en fazla 50 kalem ürün bulunabilir." },
        { status: 400 }
      );
    }

    for (const it of items) {
      if (!it.product_id || typeof it.product_id !== "string") {
        return NextResponse.json(
          { error: "Geçersiz ürün kimliği tespit edildi." },
          { status: 400 }
        );
      }
      const qty = Number(it.quantity);
      if (isNaN(qty) || qty < 1 || qty > 20) {
        return NextResponse.json(
          { error: "Ürün adedi 1 ile 20 arasında olmalıdır." },
          { status: 400 }
        );
      }
      if (it.item_note) {
        it.item_note = sanitizeString(it.item_note, 150);
      }
    }

    // 2. Validate Payment Method
    const ALLOWED_PAYMENT_METHODS = ["credit_card", "cash", "table", "cashier"];
    if (!payment_method || !ALLOWED_PAYMENT_METHODS.includes(payment_method)) {
      return NextResponse.json(
        { error: "Lütfen geçerli bir ödeme yöntemi seçiniz (Kredi Kartı veya Nakit)." },
        { status: 400 }
      );
    }

    // 3. Validate Table Token
    let resolvedTableToken = "self_service";
    if (table_token && table_token !== "self_service") {
      const cleanToken = String(table_token).trim();
      const validTable = noaStore.getTableByToken(cleanToken);
      if (!validTable) {
        return NextResponse.json(
          { error: "Geçersiz veya süresi dolmuş masa QR kodu." },
          { status: 400 }
        );
      }
      resolvedTableToken = cleanToken;
    }

    const sanitizedGeneralNote = sanitizeString(general_note, 250);
    const sanitizedIdempotencyKey = idempotency_key ? String(idempotency_key).trim().slice(0, 100) : undefined;
    const cleanCustomerPhone = customer_phone && typeof customer_phone === "string" ? customer_phone.trim() : undefined;

    // 4. Server-Side Price Verification and Order Creation
    const result = noaStore.createOrder({
      table_token: resolvedTableToken,
      items,
      payment_method,
      general_note: sanitizedGeneralNote,
      idempotency_key: sanitizedIdempotencyKey,
      customer_phone: cleanCustomerPhone,
      language: language || undefined,
    });

    // 4.1 Automatic Loyalty Stamping for Logged-In Customers
    let loyaltyRewardInfo = null;
    if (cleanCustomerPhone) {
      try {
        const settings = noaStore.getSettings() || {};
        if (settings.loyalty_enabled !== false) {
          const hasCoffee = result.order.items.some((item) => {
            if (item.is_complimentary) return false;
            const product = noaStore.getProductById(item.product_id);
            return (
              Boolean(product) &&
              (product?.category_id === "cat-sicak" || product?.category_id === "cat-soguk-kahve")
            );
          });

          const earnedStamps = hasCoffee ? 1 : 0;

          if (earnedStamps > 0) {
            const { addStampsToCustomer } = await import("@/lib/loyalty");
            const updatedCard = await addStampsToCustomer(
              cleanCustomerPhone,
              earnedStamps,
              settings.loyalty_required_stamps || 5,
              settings.loyalty_reward_name || "Hediye Kahve"
            );
            loyaltyRewardInfo = {
              stamps_earned: earnedStamps,
              current_stamps: updatedCard.stamps,
              rewards_count: updatedCard.rewards_count,
            };
          }
        }
      } catch (loyaltyErr) {
        console.warn("Digital order loyalty stamping warning:", loyaltyErr);
      }
    }

    // 5. Persist to Firestore
    try {
      const { saveOrderToFirestore, isFirebaseConfigured } = await import("@/lib/firebase/firestore");
      if (isFirebaseConfigured) {
        const saved = await saveOrderToFirestore(result.order);
        if (!saved) {
          console.error("Firestore order save returned false for order:", result.order.id);
          return NextResponse.json(
            { error: "Sipariş kaydedilemedi. Lütfen tekrar deneyiniz." },
            { status: 500 }
          );
        }
      }
    } catch (e) {
      console.error("Firestore order save failed:", e);
      return NextResponse.json(
        { error: "Sipariş kaydedilemedi. Lütfen tekrar deneyiniz." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: result.order.id,
        order_number: result.order.order_number,
        table_number: result.order.table_number,
        table_label: result.order.table_label,
        status: result.order.status,
        payment_method: result.order.payment_method,
        payment_status: result.order.payment_status,
        subtotal: result.order.subtotal,
        total: result.order.total,
        customer_phone: result.order.customer_phone,
        general_note: result.order.general_note,
        created_at: result.order.created_at,
        cancelled_reason: result.order.cancelled_reason,
        tracking_token: result.tracking_token,
        items: result.order.items.map((i) => ({
          id: i.id,
          product_name: i.product_name,
          quantity: i.quantity,
          unit_price: i.unit_price,
          total_price: i.total_price,
          item_note: i.item_note,
          is_complimentary: i.is_complimentary,
          options: i.options,
        })),
        status_history: result.order.status_history || [],
      },
      tracking_token: result.tracking_token,
      loyalty: loyaltyRewardInfo,
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

