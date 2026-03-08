import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { utenti } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { AFFIDAMENTO_PALETTE } from "@/lib/affidamento-colors";

/**
 * GET /api/users/colors-available
 * Returns colors from the predefined palette EXCLUDING those already in utenti.affidamentoColore.
 * Colors already assigned to other users are not selectable.
 */
export async function GET() {
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  const rows = await db
    .select({ affidamentoColore: utenti.affidamentoColore })
    .from(utenti);

  const usedHexSet = new Set(
    rows
      .map((r) => r.affidamentoColore)
      .filter((c): c is string => c != null && c.length > 0)
  );

  const available = AFFIDAMENTO_PALETTE.filter(
    (c) => !usedHexSet.has(c.hex)
  ).map((c) => ({ hex: c.hex, name: c.name }));

  return NextResponse.json(available);
}
