import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy passes through all requests.
 * Auth is handled via iron-session (server-side cookie) and AuthProvider/AuthGuard.
 */
export async function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/calendar/:path*", "/admin/:path*"],
};
