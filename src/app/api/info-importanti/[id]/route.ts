import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getClientIp, shouldBypassRateLimit } from "@/lib/request-utils";
import {
  updateInfoImportanteUseCase,
  deleteInfoImportanteUseCase,
  createNotificationsForOtherUsersUseCase,
} from "@/lib/use-cases";
import {
  createInfoImportanteSchema,
  infoImportanteIdParamSchema,
} from "@/lib/validations/info-importanti";
import { infoImportantiRepository } from "@/lib/repositories";

const NOT_FOUND_MESSAGE = "Info non trovata";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  if (!shouldBypassRateLimit(ip)) {
    const { allowed, retryAfter } = checkRateLimit(ip, "info-importanti");
    if (!allowed) return rateLimitResponse(retryAfter);
  }
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  const { id } = await params;
  const idResult = infoImportanteIdParamSchema.safeParse(id);
  if (!idResult.success) {
    return NextResponse.json({ error: NOT_FOUND_MESSAGE }, { status: 404 });
  }

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

  const existing = await infoImportantiRepository.findById(idResult.data);
  if (!existing) {
    return NextResponse.json({ error: NOT_FOUND_MESSAGE }, { status: 404 });
  }
  if (existing.creatoDa !== sessionResult.userId) {
    return NextResponse.json(
      { error: "Non puoi modificare info create da altri" },
      { status: 403 }
    );
  }

  const updated = await updateInfoImportanteUseCase.execute(idResult.data, {
    titolo: parsed.data.titolo,
    tipo: parsed.data.tipo,
    valore: Object.keys(parsed.data.valore).length > 0 ? parsed.data.valore : null,
  });

  if (!updated) {
    return NextResponse.json({ error: NOT_FOUND_MESSAGE }, { status: 404 });
  }

  await createNotificationsForOtherUsersUseCase.execute({
    autoreId: sessionResult.userId!,
    tipo: "info_modificata",
    entityType: "info_importante",
    entityId: idResult.data,
    titolo: updated.titolo,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(_request);
  if (!shouldBypassRateLimit(ip)) {
    const { allowed, retryAfter } = checkRateLimit(ip, "info-importanti");
    if (!allowed) return rateLimitResponse(retryAfter);
  }
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  const { id } = await params;
  const idResult = infoImportanteIdParamSchema.safeParse(id);
  if (!idResult.success) {
    return NextResponse.json({ error: NOT_FOUND_MESSAGE }, { status: 404 });
  }

  const existing = await infoImportantiRepository.findById(idResult.data);
  if (!existing) {
    return NextResponse.json({ error: NOT_FOUND_MESSAGE }, { status: 404 });
  }
  if (existing.creatoDa !== sessionResult.userId) {
    return NextResponse.json(
      { error: "Non puoi eliminare info create da altri" },
      { status: 403 }
    );
  }

  const deleted = await deleteInfoImportanteUseCase.execute(idResult.data);
  if (!deleted) {
    return NextResponse.json({ error: NOT_FOUND_MESSAGE }, { status: 404 });
  }

  await createNotificationsForOtherUsersUseCase.execute({
    autoreId: sessionResult.userId!,
    tipo: "info_eliminata",
    entityType: "info_importante",
    entityId: null,
    titolo: existing.titolo,
  });

  return NextResponse.json({ success: true });
}
