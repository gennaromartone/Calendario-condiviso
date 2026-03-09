import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireSession } from "@/lib/session";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getClientIp, shouldBypassRateLimit } from "@/lib/request-utils";
import { userRepository } from "@/lib/repositories";

export type AdminUser = {
  id: string;
  nome: string | null;
  creatoIl: string;
};

export async function GET() {
  const realUserCount = await userRepository.countExcludingLegacy();
  const hasRealUsers = realUserCount > 0;

  if (hasRealUsers) {
    const sessionResult = await requireSession();
    if (sessionResult instanceof Response) return sessionResult;
  }

  const allUsers = await userRepository.findAllWithPasswordHash();
  const users: AdminUser[] = allUsers.map((r) => ({
    id: r.id,
    nome: r.nome,
    creatoIl: r.creatoIl ?? "",
  }));

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!shouldBypassRateLimit(ip)) {
    const { allowed, retryAfter } = checkRateLimit(ip, "admin-users");
    if (!allowed) return rateLimitResponse(retryAfter);
  }
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

  const realUserCount = await userRepository.countExcludingLegacy();
  const hasRealUsers = realUserCount > 0;

  if (hasRealUsers) {
    const sessionResult = await requireSession();
    if (sessionResult instanceof Response) return sessionResult;
  }

  const passwordHash = await bcrypt.hash(password.trim(), 10);
  const { id } = await userRepository.create({ passwordHash });

  return NextResponse.json({
    id,
    message: "Genitore aggiunto. Può accedere con la propria parola d'ordine.",
  });
}
