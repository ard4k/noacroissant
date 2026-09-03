import { NextRequest, NextResponse } from "next/server";
import {
  fetchLoyaltyCard,
  addStampsToCustomer,
  removeStampFromCustomer,
  redeemFreeCoffee,
  toE164PhoneTR,
} from "@/lib/loyalty";
import { noaStore } from "@/lib/store";
import { isRequestKitchenAuthenticated, validateCsrfOrigin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");
  if (!phone) {
    return NextResponse.json(
      { error: "Lütfen bir telefon numarası belirtiniz." },
      { status: 400 }
    );
  }

  const e164 = toE164PhoneTR(phone);
  try {
    const card = await fetchLoyaltyCard(e164);
    return NextResponse.json({ success: true, card });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Sadakat kartı bilgisi alınamadı." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // CSRF validation for all loyalty mutations
  if (!validateCsrfOrigin(req)) {
    return NextResponse.json(
      { success: false, error: "CSRF doğrulaması başarısız oldu." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { action, phone, count } = body;

    if (!phone) {
      return NextResponse.json(
        { error: "Telefon numarası gereklidir." },
        { status: 400 }
      );
    }

    const e164 = toE164PhoneTR(phone);

    // Read-only action: get_card can be called by customers to fetch their own card
    if (action === "get_card") {
      const card = await fetchLoyaltyCard(e164);
      return NextResponse.json({ success: true, card });
    }

    // Mutating actions (add_stamp, remove_stamp, redeem) require staff session
    if (action === "add_stamp" || action === "remove_stamp" || action === "redeem") {
      if (!isRequestKitchenAuthenticated(req)) {
        return NextResponse.json(
          { error: "Yetkisiz erişim: Bu işlem için personel yetkisi gereklidir." },
          { status: 401 }
        );
      }
    }

    const settings = noaStore.getSettings();
    const requiredStamps = settings.loyalty_required_stamps || 5;
    const rewardName = settings.loyalty_reward_name || "Hediye Kahve";

    if (action === "add_stamp") {
      const stampCount = count && Number(count) > 0 ? Number(count) : 1;
      const updated = await addStampsToCustomer(e164, stampCount, requiredStamps, rewardName);
      return NextResponse.json({
        success: true,
        message: `${stampCount} adet damga başarıyla eklendi!`,
        card: updated,
      });
    }

    if (action === "remove_stamp") {
      const stampCount = count && Number(count) > 0 ? Number(count) : 1;
      const updated = await removeStampFromCustomer(e164, stampCount);
      return NextResponse.json({
        success: true,
        message: `${stampCount} adet damga silindi.`,
        card: updated,
      });
    }

    if (action === "redeem") {
      const updated = await redeemFreeCoffee(e164);
      return NextResponse.json({
        success: true,
        message: `${rewardName} başarıyla teslim edildi!`,
        card: updated,
      });
    }

    return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "İşlem gerçekleştirilemedi." },
      { status: 400 }
    );
  }
}

