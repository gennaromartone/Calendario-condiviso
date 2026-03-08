import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { utenti } from "@/db/schema";
import { count, ne } from "drizzle-orm";

/**
 * Returns whether users exist (v2: replaces shared password check).
 * Used by login page to show "configure on /admin" when no users.
 */
export async function GET() {
  const [{ value: realUserCount }] = await db
    .select({ value: count() })
    .from(utenti)
    .where(ne(utenti.id, "migrated-legacy"));

  return NextResponse.json({
    isPasswordSet: (realUserCount ?? 0) > 0,
  });
}
