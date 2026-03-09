import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getClientIp, shouldBypassRateLimit } from "@/lib/request-utils";
import { notificationRepository } from "@/lib/repositories";
import { z } from "zod";

const uuidSchema = z.string().uuid();

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(_request);
  if (!shouldBypassRateLimit(ip)) {
    const { allowed, retryAfter } = checkRateLimit(ip, "notifiche");
    if (!allowed) return rateLimitResponse(retryAfter);
  }
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  const { id } = await params;
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) {
    return NextResponse.json({ error: "Notifica non trovata" }, { status: 404 });
  }

  const updated = await notificationRepository.markAsRead(
    idResult.data,
    sessionResult.userId!
  );
  if (!updated) {
    return NextResponse.json({ error: "Notifica non trovata" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
