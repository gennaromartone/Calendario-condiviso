import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getClientIp, shouldBypassRateLimit } from "@/lib/request-utils";
import {
  getInfoImportantiUseCase,
  createInfoImportanteUseCase,
  createNotificationsForOtherUsersUseCase,
} from "@/lib/use-cases";
import { createInfoImportanteSchema } from "@/lib/validations/info-importanti";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (!shouldBypassRateLimit(ip)) {
    const { allowed, retryAfter } = checkRateLimit(ip, "info-importanti");
    if (!allowed) return rateLimitResponse(retryAfter);
  }
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  const items = await getInfoImportantiUseCase.execute();
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!shouldBypassRateLimit(ip)) {
    const { allowed, retryAfter } = checkRateLimit(ip, "info-importanti");
    if (!allowed) return rateLimitResponse(retryAfter);
  }
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type deve essere application/json" },
      { status: 415 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body JSON non valido" },
      { status: 400 }
    );
  }

  const parsed = createInfoImportanteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const created = await createInfoImportanteUseCase.execute({
    titolo: parsed.data.titolo,
    tipo: parsed.data.tipo,
    valore: Object.keys(parsed.data.valore).length > 0 ? parsed.data.valore : null,
    creatoDa: sessionResult.userId!,
  });

  await createNotificationsForOtherUsersUseCase.execute({
    autoreId: sessionResult.userId!,
    tipo: "info_aggiunta",
    entityType: "info_importante",
    entityId: created.id,
    titolo: created.titolo,
  });

  return NextResponse.json(created, { status: 201 });
}
