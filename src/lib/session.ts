import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "calendario_session";
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days

export interface SessionData {
  authenticated: boolean;
  userId?: string;
}

export function getSessionOptions() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set and at least 32 characters. Run: openssl rand -base64 32"
    );
  }
  return {
    password: secret,
    cookieName: SESSION_COOKIE_NAME,
    ttl: SESSION_TTL,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

export async function getSession(): Promise<SessionData> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    getSessionOptions()
  );
  return {
    authenticated: session.authenticated ?? false,
    userId: session.userId,
  };
}

export async function setSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    getSessionOptions()
  );
  session.authenticated = true;
  session.userId = userId;
  await session.save();
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    getSessionOptions()
  );
  session.destroy();
}

/**
 * Returns session if authenticated, or a 401 Response for API routes.
 * Use: const result = await requireSession(); if (result instanceof Response) return result;
 */
export async function requireSession(): Promise<SessionData | Response> {
  const session = await getSession();
  if (!session.authenticated || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}
