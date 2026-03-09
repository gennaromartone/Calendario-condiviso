/**
 * In-memory rate limiter for API endpoints.
 * Configurable per-endpoint limits. Resets on server restart.
 */

import { NextResponse } from "next/server";

export type RateLimitPrefix =
  | "login"
  | "backup"
  | "admin-users"
  | "events"
  | "info-importanti"
  | "notifiche";

const LIMITS: Record<
  RateLimitPrefix,
  { windowMs: number; maxAttempts: number }
> = {
  login: { windowMs: 15 * 60 * 1000, maxAttempts: 5 },
  backup: { windowMs: 15 * 60 * 1000, maxAttempts: 10 },
  "admin-users": { windowMs: 15 * 60 * 1000, maxAttempts: 5 },
  events: { windowMs: 2 * 60 * 1000, maxAttempts: 30 },
  "info-importanti": { windowMs: 2 * 60 * 1000, maxAttempts: 30 },
  notifiche: { windowMs: 2 * 60 * 1000, maxAttempts: 60 },
};

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}

export function checkRateLimit(
  ip: string,
  prefix: RateLimitPrefix = "login"
): { allowed: boolean; retryAfter?: number } {
  const { windowMs, maxAttempts } = LIMITS[prefix];
  const key = `${prefix}:${ip}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  entry.count += 1;

  if (entry.count > maxAttempts) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  return { allowed: true };
}

// Run cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanup, 5 * 60 * 1000);
}

export function rateLimitResponse(retryAfter?: number) {
  return NextResponse.json(
    { error: "Troppi tentativi. Riprova più tardi.", retryAfter },
    {
      status: 429,
      headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined,
    }
  );
}
