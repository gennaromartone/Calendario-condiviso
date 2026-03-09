import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getClientIp, shouldBypassRateLimit } from "@/lib/request-utils";
import { notificationRepository } from "@/lib/repositories";

export async function PATCH(_request: NextRequest) {
  const ip = getClientIp(_request);
  if (!shouldBypassRateLimit(ip)) {
    const { allowed, retryAfter } = checkRateLimit(ip, "notifiche");
    if (!allowed) return rateLimitResponse(retryAfter);
  }
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  await notificationRepository.markAllAsRead(sessionResult.userId!);
  return NextResponse.json({ success: true });
}
