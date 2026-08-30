import { NextResponse, NextRequest } from "next/server";

// Sliding Window In-Memory Rate Limiter
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key) || { timestamps: [] };

  // Filter timestamps within the sliding window
  const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (validTimestamps.length >= limit) {
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(key, { timestamps: validTimestamps });
  return false;
}

// Clean up stale IP records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    const valid = record.timestamps.filter((ts) => now - ts < 15 * 60 * 1000);
    if (valid.length === 0) {
      rateLimitMap.delete(key);
    } else {
      rateLimitMap.set(key, { timestamps: valid });
    }
  }
}, 5 * 60 * 1000);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  // 1. Rate Limiting for Sensitive Endpoints
  if (pathname === "/api/orders/create") {
    if (isRateLimited(`order_create_${ip}`, 10, 60 * 1000)) {
      return NextResponse.json(
        { error: "Çok fazla istek gönderildi. Lütfen bir dakika sonra tekrar deneyiniz." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  if (pathname.startsWith("/api/admin/auth")) {
    if (isRateLimited(`admin_auth_${ip}`, 8, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Çok fazla hatalı giriş denemesi. Güvenlik nedeniyle 15 dakika kilitlendi." },
        { status: 429, headers: { "Retry-After": "900" } }
      );
    }
  }

  if (pathname === "/api/tables/validate") {
    if (isRateLimited(`table_val_${ip}`, 30, 60 * 1000)) {
      return NextResponse.json(
        { error: "İstek limiti aşıldı." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  // 2. Protect sensitive Admin API mutations (except auth login endpoint)
  if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/auth")) {
    const sessionCookie = request.cookies.get("noa_admin_session")?.value;
    if (!sessionCookie || !sessionCookie.startsWith("admin_authenticated.")) {
      return NextResponse.json(
        { error: "Yetkisiz erişim: Lütfen admin girişi yapınız." },
        { status: 401 }
      );
    }
  }

  const response = NextResponse.next();

  // 3. Security & Noindex Headers for Admin and Mutfak
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/mutfak") ||
    pathname.startsWith("/api/admin")
  ) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/mutfak/:path*",
    "/api/admin/:path*",
    "/api/orders/create",
    "/api/tables/validate",
  ],
};
