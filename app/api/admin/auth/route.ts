import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_PIN,
  ADMIN_COOKIE_NAME,
  generateAdminSessionToken,
  validateAdminSessionToken,
  isRateLimited,
  recordFailedAttempt,
  resetRateLimit,
  verifyPin,
} from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isValid = validateAdminSessionToken(token);
  return NextResponse.json({ authenticated: isValid });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, pin } = body;
    const ip = getClientIp(req);

    // 1. Verify Action PIN or Current Session
    if (action === "verify_action") {
      if (verifyPin(pin)) {
        return NextResponse.json({ success: true, authorized: true });
      }
      return NextResponse.json({ success: false, error: "Hatalı yetkili parolası!" }, { status: 401 });
    }

    // 2. Verify Session
    if (action === "verify") {
      const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
      const isValid = validateAdminSessionToken(token);
      return NextResponse.json({ success: true, authenticated: isValid });
    }

    // 3. Logout
    if (action === "logout") {
      const res = NextResponse.json({ success: true });
      res.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return res;
    }

    // 4. Login
    if (action === "login") {
      // Check Rate Limit
      const rateLimit = isRateLimited(ip);
      if (rateLimit.limited) {
        return NextResponse.json(
          {
            success: false,
            error: `Çok fazla hatalı deneme yapıldı! Lütfen ${rateLimit.remainingSeconds} saniye bekleyiniz.`,
          },
          { status: 429 }
        );
      }

      if (verifyPin(pin)) {
        resetRateLimit(ip);
        const token = generateAdminSessionToken();
        const res = NextResponse.json({ success: true, authenticated: true });
        res.cookies.set({
          name: ADMIN_COOKIE_NAME,
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 24 * 60 * 60, // 24 hours
        });
        return res;
      } else {
        recordFailedAttempt(ip);
        return NextResponse.json(
          { success: false, error: "Hatalı şifre! Lütfen tekrar deneyiniz." },
          { status: 401 }
        );
      }
    }

    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Sunucu hatası" }, { status: 500 });
  }
}
