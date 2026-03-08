import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserById } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session.authenticated || !session.userId) {
    return NextResponse.json({
      authenticated: false,
    });
  }

  const user = await getUserById(session.userId);

  if (!user) {
    return NextResponse.json({
      authenticated: false,
    });
  }

  return NextResponse.json({
    authenticated: true,
    userId: user.id,
    nome: user.nome ?? null,
    needsName: !user.nome,
    needsAffidamentoColor: !user.affidamentoColore,
  });
}
