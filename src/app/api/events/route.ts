import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { createEventSchema } from "@/lib/validations/events";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getClientIp, shouldBypassRateLimit } from "@/lib/request-utils";
import {
  getEventsUseCase,
  createEventUseCase,
  createNotificationsForOtherUsersUseCase,
} from "@/lib/use-cases";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (!shouldBypassRateLimit(ip)) {
    const { allowed, retryAfter } = checkRateLimit(ip, "events");
    if (!allowed) return rateLimitResponse(retryAfter);
  }
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start") ?? undefined;
  const end = searchParams.get("end") ?? undefined;

  const events = await getEventsUseCase.execute({ start, end });
  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!shouldBypassRateLimit(ip)) {
    const { allowed, retryAfter } = checkRateLimit(ip, "events");
    if (!allowed) return rateLimitResponse(retryAfter);
  }
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  const body = await request.json();
  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const noteJson =
    parsed.data.note != null &&
    typeof parsed.data.note === "object" &&
    Object.keys(parsed.data.note).length > 0
      ? JSON.stringify(parsed.data.note)
      : null;

  const event = await createEventUseCase.execute({
    titolo: parsed.data.titolo,
    descrizione: parsed.data.descrizione ?? null,
    dataInizio: parsed.data.dataInizio,
    dataFine: parsed.data.dataFine,
    tipo: parsed.data.tipo,
    note: noteJson,
    luogo: parsed.data.luogo ?? null,
    creatoDa: sessionResult.userId!,
  });

  await createNotificationsForOtherUsersUseCase.execute({
    autoreId: sessionResult.userId!,
    tipo: "evento_aggiunto",
    entityType: "evento",
    entityId: event.id,
    titolo: event.titolo,
  });

  return NextResponse.json(event);
}
