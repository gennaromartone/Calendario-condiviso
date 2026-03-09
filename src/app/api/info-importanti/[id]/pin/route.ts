import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getClientIp, shouldBypassRateLimit } from "@/lib/request-utils";
import { togglePinInfoImportanteUseCase } from "@/lib/use-cases";
import { infoImportanteIdParamSchema } from "@/lib/validations/info-importanti";

const NOT_FOUND_MESSAGE = "Info non trovata";

export async function PATCH(
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

  const updated = await togglePinInfoImportanteUseCase.execute(idResult.data);
  if (!updated) {
    return NextResponse.json({ error: NOT_FOUND_MESSAGE }, { status: 404 });
  }
  return NextResponse.json(updated);
}
