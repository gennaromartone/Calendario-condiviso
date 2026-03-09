import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireSession } from "@/lib/session";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getClientIp, shouldBypassRateLimit } from "@/lib/request-utils";
import { userRepository } from "@/lib/repositories";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  if (!shouldBypassRateLimit(ip)) {
    const { allowed, retryAfter } = checkRateLimit(ip, "admin-users");
    if (!allowed) return rateLimitResponse(retryAfter);
  }
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  const { id } = await params;

  const body = await request.json();
  const password = typeof body?.password === "string" ? body.password : "";

  if (!password.trim()) {
    return NextResponse.json(
      { error: "Inserisci la parola d'ordine" },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "La parola d'ordine deve avere almeno 6 caratteri" },
      { status: 400 }
    );
  }

  const existing = await userRepository.findById(id);

  if (!existing) {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  }

  if (id === "migrated-legacy") {
    return NextResponse.json(
      { error: "Non è possibile modificare l'utente legacy" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password.trim(), 10);
  await userRepository.updatePassword(id, passwordHash);

  return NextResponse.json({
    message: "Parola d'ordine aggiornata con successo",
  });
}
