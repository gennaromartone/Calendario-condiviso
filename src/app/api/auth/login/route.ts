import { NextRequest, NextResponse } from "next/server";
import { setSession } from "@/lib/session";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getClientIp, shouldBypassRateLimit } from "@/lib/request-utils";
import { loginUseCase } from "@/lib/use-cases";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, retryAfter } = shouldBypassRateLimit(ip)
    ? { allowed: true }
    : checkRateLimit(ip, "login");

  if (!allowed) return rateLimitResponse(retryAfter);

  const body = await request.json();
  const password = typeof body?.password === "string" ? body.password : "";
  const identifier =
    typeof body?.identifier === "string" ? body.identifier : undefined;

  if (!password.trim()) {
    return NextResponse.json(
      { error: "Inserisci la parola d'ordine" },
      { status: 400 }
    );
  }

  const result = await loginUseCase.execute({
    password: password.trim(),
    identifier,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: "Parola d'ordine non riconosciuta" },
      { status: 401 }
    );
  }

  await setSession(result.user.id);

  return NextResponse.json({
    userId: result.user.id,
    needsName: !result.user.nome,
    needsAffidamentoColor: !result.user.affidamentoColore,
  });
}
