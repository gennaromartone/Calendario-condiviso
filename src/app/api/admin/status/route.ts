import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { utenti } from "@/db/schema";
import { count, ne } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function GET() {
  const [{ value: realUserCount }] = await db
    .select({ value: count() })
    .from(utenti)
    .where(ne(utenti.id, "migrated-legacy"));

  const hasUsers = (realUserCount ?? 0) > 0;
  const session = await getSession();
  const canAccess = !hasUsers || session.authenticated;

  return NextResponse.json({
    hasUsers,
    canAccess,
    authenticated: session.authenticated,
  });
}
