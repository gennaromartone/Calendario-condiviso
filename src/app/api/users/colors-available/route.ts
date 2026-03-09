import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { utenti } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { AFFIDAMENTO_PALETTE } from "@/lib/affidamento-colors";

/**
 * GET /api/users/colors-available
 * Returns colors from the predefined palette EXCLUDING those already in utenti.affidamentoColore.
 * Colors already assigned to other users are not selectable.
 *
 * Query params:
 * - excludeUserId: when editing a user in admin, exclude this user's current color from "used"
 *   so the admin can keep or change that user's color.
 */
export async function GET(request: NextRequest) {
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  const { searchParams } = new URL(request.url);
  const excludeUserId = searchParams.get("excludeUserId")?.trim() || null;

  const rows = await db
    .select({ id: utenti.id, affidamentoColore: utenti.affidamentoColore })
    .from(utenti);

  const usedHexSet = new Set(
    rows
      .filter(
        (r) =>
          r.affidamentoColore != null &&
          r.affidamentoColore.length > 0 &&
          (excludeUserId == null || r.id !== excludeUserId)
      )
      .map((r) => r.affidamentoColore as string)
  );

  const available = AFFIDAMENTO_PALETTE.filter(
    (c) => !usedHexSet.has(c.hex)
  ).map((c) => ({ hex: c.hex, name: c.name }));

  return NextResponse.json(available);
}
