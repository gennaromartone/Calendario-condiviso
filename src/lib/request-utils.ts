import { NextRequest } from "next/server";

/**
 * Extracts client IP from request headers.
 * Set TRUST_PROXY=1 in production when behind a trusted reverse proxy.
 * When TRUST_PROXY=0, headers are ignored (prevents spoofing when not behind proxy).
 * When unset, uses headers for backward compatibility.
 */
export function getClientIp(request: NextRequest): string {
  const trustProxy = process.env.TRUST_PROXY;
  if (trustProxy === "0") return "unknown";
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

const LOCALHOST_IPS = [
  "127.0.0.1",
  "::1",
  "::ffff:127.0.0.1",
  "localhost",
];

export function shouldBypassRateLimit(ip: string): boolean {
  if (LOCALHOST_IPS.includes(ip)) return true;
  if (ip === "unknown" && process.env.NODE_ENV === "development") return true;
  return false;
}
