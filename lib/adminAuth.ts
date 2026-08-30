import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const ADMIN_PIN = process.env.ADMIN_PIN || "330738";
const AUTH_SECRET = process.env.AUTH_SECRET || "noa-croissant-super-secret-key-330738-secure-auth-jwt";
export const ADMIN_COOKIE_NAME = "noa_admin_session";

// Rate limiting in-memory store
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

// Generate HMAC Signed Token: payload.timestamp.signature
export function generateAdminSessionToken(): string {
  const timestamp = Date.now().toString();
  const payload = "admin_authenticated";
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(`${payload}:${timestamp}`)
    .digest("hex");
  return `${payload}.${timestamp}.${signature}`;
}

// Validate HMAC Signed Token (valid for 24 hours)
export function validateAdminSessionToken(token: string | null | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [payload, timestampStr, signature] = parts;
  if (payload !== "admin_authenticated") return false;

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Max session age: 24 hours
  const MAX_SESSION_AGE_MS = 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > MAX_SESSION_AGE_MS) return false;

  const expectedSignature = crypto
    .createHmac("sha256", AUTH_SECRET)
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

// Helper to check request authentication in API routes
export function isRequestAdminAuthenticated(req: NextRequest): boolean {
  const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return validateAdminSessionToken(cookie);
}
