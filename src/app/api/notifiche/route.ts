import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getClientIp, shouldBypassRateLimit } from "@/lib/request-utils";
import { notificationRepository } from "@/lib/repositories";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (!shouldBypassRateLimit(ip)) {
    const { allowed, retryAfter } = checkRateLimit(ip, "notifiche");
    if (!allowed) return rateLimitResponse(retryAfter);
  }
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  const items = await notificationRepository.findByUserId(
    sessionResult.userId!,
    { unreadOnly }
  );
  return NextResponse.json(items);
}
