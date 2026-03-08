import { NextRequest, NextResponse } from "next/server";
import { findUserByPassword } from "@/lib/auth";
import { setSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function shouldBypassRateLimit(ip: string): boolean {
  const localhostIps = [
    "127.0.0.1",
    "::1",
    "::ffff:127.0.0.1",
    "localhost",
  ];
  if (localhostIps.includes(ip)) return true;
  // When headers missing (e.g. direct localhost), IP can be "unknown"
  if (ip === "unknown" && process.env.NODE_ENV === "development") return true;
  return false;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, retryAfter } = shouldBypassRateLimit(ip)
    ? { allowed: true }
    : checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      {
        error: "Troppi tentativi. Riprova più tardi.",
        retryAfter,
      },
      {
        status: 429,
        headers: retryAfter
          ? { "Retry-After": String(retryAfter) }
          : undefined,
      }
    );
  }

  const body = await request.json();
  const password = typeof body?.password === "string" ? body.password : "";

  if (!password.trim()) {
    return NextResponse.json(
      { error: "Inserisci la parola d'ordine" },
      { status: 400 }
    );
  }

  const user = await findUserByPassword(password.trim());

  if (!user) {
    return NextResponse.json(
      { error: "Parola d'ordine non riconosciuta" },
      { status: 401 }
    );
  }

  await setSession(user.id);

  return NextResponse.json({
    userId: user.id,
    needsName: !user.nome,
    needsAffidamentoColor: !user.affidamentoColore,
  });
}
