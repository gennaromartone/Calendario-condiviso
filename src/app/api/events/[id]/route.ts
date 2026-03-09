import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { updateEventSchema } from "@/lib/validations/events";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getClientIp, shouldBypassRateLimit } from "@/lib/request-utils";
import { eventRepository } from "@/lib/repositories";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  if (!shouldBypassRateLimit(ip)) {
    const { allowed, retryAfter } = checkRateLimit(ip, "events");
    if (!allowed) return rateLimitResponse(retryAfter);
  }
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  const { id } = await params;
  const existing = await eventRepository.findById(id);

  if (!existing) {
    return NextResponse.json({ error: "Evento non trovato" }, { status: 404 });
  }
  if (existing.creatoDa !== sessionResult.userId) {
    return NextResponse.json(
      { error: "Non puoi modificare eventi creati da altri" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = updateEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = await eventRepository.update(id, parsed.data);
  if (!result) {
    return NextResponse.json({ error: "Evento non trovato" }, { status: 404 });
  }
  return NextResponse.json(result);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  if (!shouldBypassRateLimit(ip)) {
    const { allowed, retryAfter } = checkRateLimit(ip, "events");
    if (!allowed) return rateLimitResponse(retryAfter);
  }
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  const { id } = await params;

  const existing = await eventRepository.findById(id);
  if (!existing) {
    return NextResponse.json({ error: "Evento non trovato" }, { status: 404 });
  }
  if (existing.creatoDa !== sessionResult.userId) {
    return NextResponse.json(
      { error: "Non puoi eliminare eventi creati da altri" },
      { status: 403 }
    );
  }

  await eventRepository.delete(id);

  return NextResponse.json({ success: true });
}
