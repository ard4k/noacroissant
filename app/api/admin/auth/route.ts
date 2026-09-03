import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  KITCHEN_COOKIE_NAME,
  generateSessionToken,
  validateSessionToken,
  isRateLimited,
  recordFailedAttempt,
  resetRateLimit,
  verifyPin,
  UserRole,
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
  const role = (req.nextUrl.searchParams.get("role") || "admin") as UserRole;
  const adminCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const kitchenCookie = req.cookies.get(KITCHEN_COOKIE_NAME)?.value;

  const isAdminValid = validateSessionToken(adminCookie, "admin");
  const isKitchenValid = isAdminValid || validateSessionToken(kitchenCookie, "kitchen");

  if (role === "kitchen") {
    return NextResponse.json({ authenticated: isKitchenValid, role: isAdminValid ? "admin" : isKitchenValid ? "kitchen" : null });
  }

  return NextResponse.json({ authenticated: isAdminValid, role: isAdminValid ? "admin" : null });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, pin, role = "admin" } = body;
    const ip = getClientIp(req);
    const targetRole: UserRole = role === "kitchen" ? "kitchen" : "admin";

    // 1. Verify Action PIN
    if (action === "verify_action") {
      if (verifyPin(pin, "admin")) {
        return NextResponse.json({ success: true, authorized: true });
      }
      return NextResponse.json({ success: false, error: "Hatalı yetkili parolası!" }, { status: 401 });
    }

    // 2. Verify Session
    if (action === "verify") {
      const cookieName = targetRole === "kitchen" ? KITCHEN_COOKIE_NAME : ADMIN_COOKIE_NAME;
      const token = req.cookies.get(cookieName)?.value || req.cookies.get(ADMIN_COOKIE_NAME)?.value;
      const isValid = validateSessionToken(token, targetRole);
      return NextResponse.json({ success: true, authenticated: isValid, role: targetRole });
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
      res.cookies.set({
        name: KITCHEN_COOKIE_NAME,
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

      if (verifyPin(pin, targetRole)) {
        resetRateLimit(ip);
        const token = generateSessionToken(targetRole);
        const cookieName = targetRole === "kitchen" ? KITCHEN_COOKIE_NAME : ADMIN_COOKIE_NAME;
        const res = NextResponse.json({ success: true, authenticated: true, role: targetRole });
        res.cookies.set({
          name: cookieName,
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

