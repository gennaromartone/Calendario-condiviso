import { z } from "zod";

export const eventoTipoEnum = z.enum([
  "affidamento",
  "scuola",
  "sport",
  "altro",
]);

/** Note per l'evento: generali o per giorno */
export const eventNotesSchema = z.object({
  general: z.string().optional(),
  byDay: z.record(z.string(), z.string()).optional(),
});

export type EventNotes = z.infer<typeof eventNotesSchema>;

export const createEventSchema = z.object({
  titolo: z.string().min(1).max(255),
  descrizione: z.string().optional(),
  dataInizio: z.string().datetime(),
  dataFine: z.string().datetime(),
  tipo: eventoTipoEnum,
  note: eventNotesSchema.nullable().optional(),
  luogo: z.string().max(500).optional(),
});

export const updateEventSchema = createEventSchema.partial();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

/** Form schema: uses date+time strings, converts to ISO datetime for API */
export const eventFormSchema = z
  .object({
    titolo: z.string().min(1, "Il titolo è obbligatorio").max(255),
    descrizione: z.string().optional(),
    dataInizioDate: z.string().min(1, "La data di inizio è obbligatoria"),
    dataInizioTime: z.string().min(1, "L'ora di inizio è obbligatoria"),
    dataFineDate: z.string().min(1, "La data di fine è obbligatoria"),
    dataFineTime: z.string().min(1, "L'ora di fine è obbligatoria"),
    tipo: eventoTipoEnum,
    noteGeneral: z.string().optional(),
    noteByDay: z.record(z.string(), z.string().optional()).optional(),
    luogo: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      const start = new Date(`${data.dataInizioDate}T${data.dataInizioTime}`);
      const end = new Date(`${data.dataFineDate}T${data.dataFineTime}`);
      return end >= start;
    },
    { message: "La data di fine deve essere successiva o uguale alla data di inizio", path: ["dataFineDate"] }
  );

export type EventFormValues = z.infer<typeof eventFormSchema>;

export function eventFormToApiPayload(values: EventFormValues): CreateEventInput {
  const byDayFiltered =
    values.noteByDay &&
    Object.fromEntries(
      Object.entries(values.noteByDay).filter(([, v]) => v?.trim())
    ) as Record<string, string>;
  const hasByDay = byDayFiltered && Object.keys(byDayFiltered).length > 0;
  const hasGeneral = !!values.noteGeneral?.trim();

  const note: EventNotes | null =
    hasGeneral || hasByDay
      ? {
          ...(hasGeneral && { general: values.noteGeneral!.trim() }),
          ...(hasByDay && { byDay: byDayFiltered! }),
        }
      : null;

  return {
    titolo: values.titolo,
    descrizione: values.descrizione || undefined,
    dataInizio: new Date(`${values.dataInizioDate}T${values.dataInizioTime}`).toISOString(),
    dataFine: new Date(`${values.dataFineDate}T${values.dataFineTime}`).toISOString(),
    tipo: values.tipo,
    ...(note !== null ? { note } : { note: null }),
    luogo: values.luogo?.trim() || undefined,
  };
}
