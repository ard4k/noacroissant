if (typeof self === "undefined" && typeof globalThis !== "undefined") {
  (globalThis as unknown as { self: typeof globalThis }).self = globalThis;
}

import { NextResponse, NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Sliding Window In-Memory Rate Limiter
// NOTE: In-memory only — not persistent across Vercel instances.
// Suitable for short-burst protection but not distributed rate limiting.
// ---------------------------------------------------------------------------
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key) || { timestamps: [] };
  const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);
  if (validTimestamps.length >= limit) {
    return true;
  }
  validTimestamps.push(now);
  rateLimitMap.set(key, { timestamps: validTimestamps });
  return false;
}

// ---------------------------------------------------------------------------
// Web Crypto HMAC-based session token validation for Edge Middleware
// ---------------------------------------------------------------------------
async function verifyHmacSignature(
  secret: string,
  data: string,
  expectedHexSig: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(data)
    );
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const calculatedHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (calculatedHex.length !== expectedHexSig.length) return false;
    let diff = 0;
    for (let i = 0; i < calculatedHex.length; i++) {
      diff |= calculatedHex.charCodeAt(i) ^ expectedHexSig.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

async function validateTokenInMiddleware(
  token: string | undefined,
  requiredPayloadPrefix: string
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [payload, timestampStr, signature] = parts;

  if (!payload.startsWith(requiredPayloadPrefix)) return false;

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Max session age: 24 hours
  const MAX_SESSION_AGE_MS = 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > MAX_SESSION_AGE_MS) return false;

  const secret =
    process.env.AUTH_SECRET ||
    (process.env.NODE_ENV !== "production"
      ? "dev-secret-change-me-before-production-deploy"
      : "");
  if (!secret) return false;

  return await verifyHmacSignature(secret, `${payload}:${timestampStr}`, signature);
}

async function hasValidStaffSession(
  request: NextRequest,
  requiredRole: "admin" | "kitchen" = "kitchen"
): Promise<boolean> {
  // Admin cookie grants both admin and kitchen access
  const adminCookie = request.cookies.get("noa_admin_session")?.value;
  if (await validateTokenInMiddleware(adminCookie, "admin_authenticated")) {
    return true;
  }

  // Kitchen cookie grants kitchen access only
  if (requiredRole === "kitchen") {
    const kitchenCookie = request.cookies.get("noa_kitchen_session")?.value;
    if (await validateTokenInMiddleware(kitchenCookie, "kitchen_authenticated")) {
      return true;
    }
  }

  return false;
}

// ---------------------------------------------------------------------------
// CSRF: Reject mutating requests (POST/PUT/PATCH/DELETE) that are missing
// an Origin header or whose Origin does not match the host.
// ---------------------------------------------------------------------------
function validateCsrfInMiddleware(request: NextRequest): boolean {
  const method = request.method;
  const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  if (!isMutating) return true;

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin) {
    const referer = request.headers.get("referer");
    if (!referer || !host) return false;
    try {
      const refHost = new URL(referer).host;
      return refHost === host;
    } catch {
      return false;
    }
  }

  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  // 1. Rate Limiting for Sensitive Endpoints
  if (pathname === "/api/order/create" || pathname === "/api/orders/create") {
    if (isRateLimited(`order_create_${ip}`, 30, 60 * 1000)) {
      return NextResponse.json(
        { error: "Çok fazla istek gönderildi. Lütfen bir dakika sonra tekrar deneyiniz." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  if (pathname === "/api/tables/validate") {
    if (isRateLimited(`table_val_${ip}`, 60, 60 * 1000)) {
      return NextResponse.json(
        { error: "İstek limiti aşıldı." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  // 2A. CSRF check on all mutating API endpoints (before auth checks)
  const isMutatingApi = request.method !== "GET" && pathname.startsWith("/api/");
  if (isMutatingApi && !pathname.startsWith("/api/admin/auth")) {
    if (!validateCsrfInMiddleware(request)) {
      return NextResponse.json(
        { error: "Güvenlik doğrulaması başarısız: Geçersiz istek kaynağı." },
        { status: 403 }
      );
    }
  }

  // 2B. Protect Admin-Only Mutations
  if (
    (pathname === "/api/products" && request.method !== "GET") ||
    (pathname === "/api/settings" && request.method !== "GET") ||
    pathname === "/api/admin/regenerate-token" ||
    (pathname === "/api/admin/orders" && request.method === "POST")
  ) {
    if (!(await hasValidStaffSession(request, "admin"))) {
      return NextResponse.json(
        { error: "Yetkisiz erişim: Bu işlem için yönetici yetkisi gereklidir." },
        { status: 401 }
      );
    }
  }

  // 2C. Staff APIs (Admin or Kitchen)
  if (
    (pathname === "/api/admin/orders" && request.method === "GET") ||
    pathname === "/api/admin/order-status" ||
    pathname === "/api/orders/stream"
  ) {
    if (!(await hasValidStaffSession(request, "kitchen"))) {
      return NextResponse.json(
        { error: "Yetkisiz erişim: Lütfen personel girişi yapınız." },
        { status: 401 }
      );
    }
  }

  // 2D. Generic /api/admin fallback
  if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/auth")) {
    if (!(await hasValidStaffSession(request, "kitchen"))) {
      return NextResponse.json(
        { error: "Yetkisiz erişim: Lütfen personel girişi yapınız." },
        { status: 401 }
      );
    }
  }

  const response = NextResponse.next();

  // 3. Security Headers
  // HSTS — applied to all responses
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/mutfak") ||
    pathname.startsWith("/siparis") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/orders/stream")
  ) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  } else {
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/mutfak/:path*",
    "/siparis/:path*",
    "/api/admin/:path*",
    "/api/order/:path*",
    "/api/orders/:path*",
    "/api/products",
    "/api/settings",
    "/api/tables/:path*",
  ],
};

