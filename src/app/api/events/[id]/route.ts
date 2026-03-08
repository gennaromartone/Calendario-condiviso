import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eventi } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { updateEventSchema } from "@/lib/validations/events";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  const { id } = await params;
  const [existing] = await db
    .select({ creatoDa: eventi.creatoDa })
    .from(eventi)
    .where(eq(eventi.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Evento non trovato" }, { status: 404 });
  }
  if (existing.creatoDa !== sessionResult.userId) {
    return NextResponse.json(
      { error: "Non puoi modificare eventi creati da altri" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = updateEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updateData = { ...parsed.data } as Record<string, unknown>;
  if ("note" in updateData && updateData.note !== undefined) {
    updateData.note =
      updateData.note !== null && typeof updateData.note === "object"
        ? JSON.stringify(updateData.note)
        : updateData.note;
  }

  const [updated] = await db
    .update(eventi)
    .set({
      ...updateData,
      modificatoIl: new Date().toISOString(),
    })
    .where(eq(eventi.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Evento non trovato" }, { status: 404 });
  }

  const result = {
    ...updated,
    note:
      updated.note && typeof updated.note === "string"
        ? (JSON.parse(updated.note) as { general?: string; byDay?: Record<string, string> })
        : updated.note,
  };

  return NextResponse.json(result);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  const { id } = await params;

  const [existing] = await db
    .select({ creatoDa: eventi.creatoDa })
    .from(eventi)
    .where(eq(eventi.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Evento non trovato" }, { status: 404 });
  }
  if (existing.creatoDa !== sessionResult.userId) {
    return NextResponse.json(
      { error: "Non puoi eliminare eventi creati da altri" },
      { status: 403 }
    );
  }

  await db.delete(eventi).where(eq(eventi.id, id));

  return NextResponse.json({ success: true });
}
