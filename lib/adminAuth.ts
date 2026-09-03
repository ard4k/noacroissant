import crypto from "crypto";
import { NextRequest } from "next/server";
import { OrderStatus } from "./types";

// ---------------------------------------------------------------------------
// Security: Secrets are read dynamically from environment variables.
// In production, missing secrets fail-closed safely without crashing build.
// ---------------------------------------------------------------------------

export function getAdminPin(): string {
  const pin = process.env.ADMIN_PIN?.trim().replace(/^["']|["']$/g, "");
  if (pin) return pin;
  if (process.env.NODE_ENV !== "production") {
    return "330738"; // Development default
  }
  return ""; // Fail-closed in production if unconfigured
}

export function getKitchenPin(): string {
  const kp = process.env.KITCHEN_PIN?.trim().replace(/^["']|["']$/g, "");
  if (kp) return kp;
  return getAdminPin();
}

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim().replace(/^["']|["']$/g, "");
  if (secret) return secret;
  if (process.env.NODE_ENV !== "production") {
    return "dev-secret-change-me-before-production-deploy";
  }
  return ""; // Fail-closed in production if unconfigured
}

export const ADMIN_PIN = getAdminPin();
export const KITCHEN_PIN = getKitchenPin();

export const ADMIN_COOKIE_NAME = "noa_admin_session";
export const KITCHEN_COOKIE_NAME = "noa_kitchen_session";

export type UserRole = "admin" | "kitchen";

export function verifyPin(input: unknown, role: UserRole = "admin"): boolean {
  if (!input) return false;
  const cleanInput = String(input).trim().replace(/^["']|["']$/g, "");
  const adminPin = getAdminPin();
  const kitchenPin = getKitchenPin();

  if (!adminPin && !kitchenPin) {
    console.error("[NOA Auth] ADMIN_PIN is not configured.");
    return false;
  }

  if (role === "kitchen") {
    return (
      (kitchenPin !== "" && cleanInput === kitchenPin) ||
      (adminPin !== "" && cleanInput === adminPin)
    );
  }
  return adminPin !== "" && cleanInput === adminPin;
}

// Rate limiting in-memory store with sliding window
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 60 * 1000; // 1 minute lockout

export function isRateLimited(ip: string): { limited: boolean; remainingSeconds?: number } {
  const record = failedAttempts.get(ip);
  if (!record) return { limited: false };

  const now = Date.now();
  if (now - record.lastAttempt > LOCKOUT_TIME_MS) {
    failedAttempts.delete(ip);
    return { limited: false };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const remainingSeconds = Math.ceil((LOCKOUT_TIME_MS - (now - record.lastAttempt)) / 1000);
    return { limited: true, remainingSeconds };
  }

  return { limited: false };
}

export function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const record = failedAttempts.get(ip) || { count: 0, lastAttempt: now };
  record.count += 1;
  record.lastAttempt = now;
  failedAttempts.set(ip, record);
}

export function resetRateLimit(ip: string) {
  failedAttempts.delete(ip);
}

// Generate HMAC Signed Token: role.timestamp.signature
export function generateSessionToken(role: UserRole = "admin"): string {
  const timestamp = Date.now().toString();
  const payload = `${role}_authenticated`;
  const secret = getAuthSecret();
  if (!secret) {
    throw new Error("[NOA Auth] AUTH_SECRET is not configured.");
  }
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${payload}:${timestamp}`)
    .digest("hex");
  return `${payload}.${timestamp}.${signature}`;
}

export function generateAdminSessionToken(): string {
  return generateSessionToken("admin");
}

// Validate HMAC Signed Token (valid for 24 hours)
export function validateSessionToken(token: string | null | undefined, requiredRole: UserRole = "admin"): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [payload, timestampStr, signature] = parts;
  
  // Admin token can access kitchen, but kitchen token cannot access admin
  if (requiredRole === "admin" && payload !== "admin_authenticated") {
    return false;
  }
  if (requiredRole === "kitchen" && payload !== "admin_authenticated" && payload !== "kitchen_authenticated") {
    return false;
  }

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Max session age: 24 hours
  const MAX_SESSION_AGE_MS = 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > MAX_SESSION_AGE_MS) return false;

  const secret = getAuthSecret();
  if (!secret) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${payload}:${timestampStr}`)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (e) {
    return false;
  }
}

export function validateAdminSessionToken(token: string | null | undefined): boolean {
  return validateSessionToken(token, "admin");
}

// Helper to check request authentication in API routes
export function isRequestAuthenticated(req: NextRequest, requiredRole: UserRole = "admin"): boolean {
  const adminCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  // Admin token grants access to ALL roles (admin is a superset)
  if (validateSessionToken(adminCookie, "admin")) {
    return true;
  }
  if (requiredRole === "kitchen") {
    const kitchenCookie = req.cookies.get(KITCHEN_COOKIE_NAME)?.value;
    return validateSessionToken(kitchenCookie, "kitchen");
  }
  return false;
}

export function isRequestAdminAuthenticated(req: NextRequest): boolean {
  return isRequestAuthenticated(req, "admin");
}

export function isRequestKitchenAuthenticated(req: NextRequest): boolean {
  return isRequestAuthenticated(req, "kitchen");
}

// CSRF Origin verification for mutating requests
export function validateCsrfOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  
  if (!origin) {
    const referer = req.headers.get("referer");
    if (!referer || !host) return false;
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }

  if (!host) return false;

  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

// State transition validation matrix
const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  received: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["served", "cancelled"],
  served: [], // Final state
  cancelled: [], // Final state
};

export function isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  if (currentStatus === newStatus) return true;
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  return Boolean(allowed && allowed.includes(newStatus));
}

