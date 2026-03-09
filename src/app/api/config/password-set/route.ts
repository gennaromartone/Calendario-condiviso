import { NextResponse } from "next/server";
import { userRepository } from "@/lib/repositories";

/**
 * Returns whether users exist (v2: replaces shared password check).
 * Used by login page to show "configure on /admin" when no users.
 */
export async function GET() {
  const count = await userRepository.countExcludingLegacy();
  return NextResponse.json({
    isPasswordSet: count > 0,
  });
}
