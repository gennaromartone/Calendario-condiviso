import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { config, eventi } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { createEventSchema } from "@/lib/validations/events";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getClientIp, shouldBypassRateLimit } from "@/lib/request-utils";
import { eq } from "drizzle-orm";

const EVENT_TIPOS = ["affidamento", "scuola", "sport", "altro"] as const;

type StoredEvent = {
  id: string;
  titolo: string;
  descrizione: string | null;
  dataInizio: string;
  dataFine: string;
  tipo: (typeof EVENT_TIPOS)[number];
  creatoDa: string | null;
  creatoIl: string;
  modificatoIl: string;
};

function isValidEvent(raw: unknown): raw is StoredEvent {
  if (!raw || typeof raw !== "object") return false;
  const o = raw as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.titolo === "string" &&
    o.titolo.length > 0 &&
    typeof o.dataInizio === "string" &&
    typeof o.dataFine === "string" &&
    EVENT_TIPOS.includes(o.tipo as (typeof EVENT_TIPOS)[number])
  );
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (!shouldBypassRateLimit(ip)) {
    const { allowed, retryAfter } = checkRateLimit(ip, "backup");
    if (!allowed) return rateLimitResponse(retryAfter);
  }
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  const events = await db.select().from(eventi).orderBy(eventi.dataInizio);
  const configRows = await db
    .select()
    .from(config)
    .where(eq(config.id, "default"))
    .limit(1);

  const configData = configRows[0]
    ? { updatedAt: configRows[0].updatedAt }
    : undefined;

  const data = {
    version: 2 as const,
    exportedAt: new Date().toISOString(),
    config: configData,
    events,
  };

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!shouldBypassRateLimit(ip)) {
    const { allowed, retryAfter } = checkRateLimit(ip, "backup");
    if (!allowed) return rateLimitResponse(retryAfter);
  }
  const sessionResult = await requireSession();
  if (sessionResult instanceof Response) return sessionResult;

  const parsed: unknown = await request.json();

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("events" in parsed) ||
    !Array.isArray((parsed as { events: unknown[] }).events)
  ) {
    return NextResponse.json(
      { error: "Formato backup non valido" },
      { status: 400 }
    );
  }

  const data = parsed as { events: StoredEvent[]; config?: { updatedAt?: string } };
  const mode = (parsed as { mode?: "replace" | "merge" }).mode ?? "replace";

  if (mode === "replace") {
    await db.delete(eventi);
  }

  let imported = 0;
  for (const raw of data.events) {
    if (!isValidEvent(raw)) continue;

    const validated = createEventSchema.safeParse({
      titolo: raw.titolo,
      descrizione: raw.descrizione ?? undefined,
      dataInizio: raw.dataInizio,
      dataFine: raw.dataFine,
      tipo: raw.tipo,
    });

    if (!validated.success) continue;

    const eventValues = {
      id: raw.id,
      titolo: raw.titolo,
      descrizione: raw.descrizione ?? null,
      dataInizio: raw.dataInizio,
      dataFine: raw.dataFine,
      tipo: raw.tipo,
      creatoDa: raw.creatoDa && raw.creatoDa !== "" ? raw.creatoDa : "migrated-legacy",
      creatoIl: raw.creatoIl ?? new Date().toISOString(),
      modificatoIl: raw.modificatoIl ?? new Date().toISOString(),
    };

    if (mode === "merge") {
      await db
        .insert(eventi)
        .values(eventValues)
        .onConflictDoUpdate({
          target: eventi.id,
          set: {
            titolo: raw.titolo,
            descrizione: raw.descrizione ?? null,
            dataInizio: raw.dataInizio,
            dataFine: raw.dataFine,
            tipo: raw.tipo,
            creatoDa:
              raw.creatoDa && raw.creatoDa !== ""
                ? raw.creatoDa
                : "migrated-legacy",
            modificatoIl: new Date().toISOString(),
          },
        });
    } else {
      await db.insert(eventi).values(eventValues);
    }
    imported++;
  }

  let configImported = false;
  if (data.config?.updatedAt) {
    await db
      .insert(config)
      .values({
        id: "default",
        updatedAt: data.config.updatedAt,
      })
      .onConflictDoUpdate({
        target: config.id,
        set: {
          updatedAt: data.config.updatedAt,
        },
      });
    configImported = true;
  }

  return NextResponse.json({ eventsCount: imported, configImported });
}
