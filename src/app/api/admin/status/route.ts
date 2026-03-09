import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { userRepository } from "@/lib/repositories";

export async function GET() {
  const realUserCount = await userRepository.countExcludingLegacy();
  const hasUsers = realUserCount > 0;
  const session = await getSession();
  const canAccess = !hasUsers || session.authenticated;

  return NextResponse.json({
    hasUsers,
    canAccess,
    authenticated: session.authenticated,
  });
}
