import { z } from "zod";

export const infoImportanteTipoEnum = z.enum(["scuola", "medico", "altro"]);

const telefonoSchema = z
  .string()
  .max(50)
  .transform((s) => s.trim())
  .pipe(z.string().min(1).regex(/^[\d\s\+\-\(\)\.]+$/, "Il telefono può contenere solo numeri e caratteri + - ( ) ."));

const indirizzoSchema = z.string().max(500).transform((s) => s.trim());

const contenutoSchema = z.string().max(1000).transform((s) => s.trim());

const valoreBaseSchema = z
  .object({
    telefono: z.string().optional(),
    indirizzo: z.string().optional(),
    contenuto: z.string().optional(),
  })
  .strict(); // Reject unknown keys per security plan

/** API schema for creating info importante - validates valore based on tipo */
export const createInfoImportanteSchema = z
  .object({
    titolo: z.string().min(1).max(200).transform((s) => s.trim()),
    tipo: infoImportanteTipoEnum,
    valore: valoreBaseSchema.optional(),
  })
  .superRefine((data, ctx) => {
    const v = data.valore ?? {};
    if (data.tipo === "scuola") {
      const telefono = (v.telefono ?? "").trim();
      if (!telefono) {
        ctx.addIssue({ code: "custom", message: "Il telefono è obbligatorio", path: ["valore", "telefono"] });
        return;
      }
      const parsed = telefonoSchema.safeParse(telefono);
      if (!parsed.success) {
        ctx.addIssue({ code: "custom", message: parsed.error.errors[0]?.message ?? "Telefono non valido", path: ["valore", "telefono"] });
      }
      const indirizzo = (v.indirizzo ?? "").trim();
      if (indirizzo) {
        const indParsed = indirizzoSchema.safeParse(indirizzo);
        if (!indParsed.success) {
          ctx.addIssue({ code: "custom", message: "Indirizzo troppo lungo", path: ["valore", "indirizzo"] });
        }
      }
    } else if (data.tipo === "medico") {
      const telefono = (v.telefono ?? "").trim();
      const indirizzo = (v.indirizzo ?? "").trim();
      if (!telefono) {
        ctx.addIssue({ code: "custom", message: "Il telefono è obbligatorio", path: ["valore", "telefono"] });
      } else {
        const parsed = telefonoSchema.safeParse(telefono);
        if (!parsed.success) {
          ctx.addIssue({ code: "custom", message: parsed.error.errors[0]?.message ?? "Telefono non valido", path: ["valore", "telefono"] });
        }
      }
      if (!indirizzo) {
        ctx.addIssue({ code: "custom", message: "L'indirizzo è obbligatorio", path: ["valore", "indirizzo"] });
      } else {
        const parsed = indirizzoSchema.safeParse(indirizzo);
        if (!parsed.success) {
          ctx.addIssue({ code: "custom", message: "Indirizzo troppo lungo", path: ["valore", "indirizzo"] });
        }
      }
    } else if (data.tipo === "altro") {
      const contenuto = (v.contenuto ?? "").trim();
      if (!contenuto) {
        ctx.addIssue({ code: "custom", message: "Il contenuto è obbligatorio", path: ["valore", "contenuto"] });
      } else {
        const parsed = contenutoSchema.safeParse(contenuto);
        if (!parsed.success) {
          ctx.addIssue({ code: "custom", message: "Contenuto troppo lungo", path: ["valore", "contenuto"] });
        }
      }
      const telefono = (v.telefono ?? "").trim();
      const indirizzo = (v.indirizzo ?? "").trim();
      if (telefono) {
        const parsed = telefonoSchema.safeParse(telefono);
        if (!parsed.success) {
          ctx.addIssue({ code: "custom", message: parsed.error.errors[0]?.message ?? "Telefono non valido", path: ["valore", "telefono"] });
        }
      }
      if (indirizzo) {
        const parsed = indirizzoSchema.safeParse(indirizzo);
        if (!parsed.success) {
          ctx.addIssue({ code: "custom", message: "Indirizzo troppo lungo", path: ["valore", "indirizzo"] });
        }
      }
    }
  })
  .transform((data) => {
    const v = data.valore ?? {};
    let valore: { telefono?: string; indirizzo?: string; contenuto?: string } = {};
    if (data.tipo === "scuola") {
      const telefono = telefonoSchema.parse((v.telefono ?? "").trim());
      const indirizzo = (v.indirizzo ?? "").trim();
      valore = { telefono, ...(indirizzo && { indirizzo: indirizzoSchema.parse(indirizzo) }) };
    } else if (data.tipo === "medico") {
      const telefono = telefonoSchema.parse((v.telefono ?? "").trim());
      const indirizzo = indirizzoSchema.parse((v.indirizzo ?? "").trim());
      valore = { telefono, indirizzo };
    } else if (data.tipo === "altro") {
      const contenuto = contenutoSchema.parse((v.contenuto ?? "").trim());
      const telefono = (v.telefono ?? "").trim();
      const indirizzo = (v.indirizzo ?? "").trim();
      valore = {
        contenuto,
        ...(telefono && { telefono: telefonoSchema.parse(telefono) }),
        ...(indirizzo && { indirizzo: indirizzoSchema.parse(indirizzo) }),
      };
    }
    return { titolo: data.titolo, tipo: data.tipo, valore };
  });

export type CreateInfoImportanteInput = z.infer<typeof createInfoImportanteSchema>;

/** Param [id] validation - use before any DB query */
export const infoImportanteIdParamSchema = z.string().uuid();

/** Form schema: flat fields for UI, mapped to API payload */
export const infoImportanteFormSchema = z.object({
  titolo: z.string().min(1, "Il titolo è obbligatorio").max(200),
  tipo: infoImportanteTipoEnum,
  telefono: z.string().optional(),
  indirizzo: z.string().optional(),
  contenuto: z.string().optional(),
}).superRefine((data, ctx) => {
  const t = (data.telefono ?? "").trim();
  const i = (data.indirizzo ?? "").trim();
  if (t && !/^[\d\s\+\-\(\)\.]+$/.test(t)) {
    ctx.addIssue({ code: "custom", message: "Il telefono può contenere solo numeri e caratteri + - ( ) .", path: ["telefono"] });
  } else if (t && t.length > 50) {
    ctx.addIssue({ code: "custom", message: "Telefono troppo lungo", path: ["telefono"] });
  }
  if (i && i.length > 500) {
    ctx.addIssue({ code: "custom", message: "Indirizzo troppo lungo", path: ["indirizzo"] });
  }
  if (data.tipo === "scuola") {
    if (!t) ctx.addIssue({ code: "custom", message: "Il telefono è obbligatorio", path: ["telefono"] });
  } else if (data.tipo === "medico") {
    if (!t) ctx.addIssue({ code: "custom", message: "Il telefono è obbligatorio", path: ["telefono"] });
    if (!i) ctx.addIssue({ code: "custom", message: "L'indirizzo è obbligatorio", path: ["indirizzo"] });
  } else if (data.tipo === "altro") {
    const c = (data.contenuto ?? "").trim();
    if (!c) ctx.addIssue({ code: "custom", message: "Il contenuto è obbligatorio", path: ["contenuto"] });
    else if (c.length > 1000) ctx.addIssue({ code: "custom", message: "Contenuto troppo lungo", path: ["contenuto"] });
  }
});

export type InfoImportanteFormValues = z.infer<typeof infoImportanteFormSchema>;

export function infoImportanteFormToApiPayload(
  values: InfoImportanteFormValues
): CreateInfoImportanteInput {
  const t = values.tipo;
  const telefono = (values.telefono ?? "").trim();
  const indirizzo = (values.indirizzo ?? "").trim();
  const contenuto = (values.contenuto ?? "").trim();
  let valore: { telefono?: string; indirizzo?: string; contenuto?: string } = {};
  if (t === "scuola") {
    valore = {
      ...(telefono && { telefono }),
      ...(indirizzo && { indirizzo }),
    };
  } else if (t === "medico") {
    valore = {
      ...(telefono && { telefono }),
      ...(indirizzo && { indirizzo }),
    };
  } else if (t === "altro") {
    valore = {
      contenuto,
      ...(telefono && { telefono }),
      ...(indirizzo && { indirizzo }),
    };
  }
  return { titolo: values.titolo.trim(), tipo: t, valore };
}

/** Map API record to form values for edit mode */
export function infoImportanteRecordToFormValues(record: {
  titolo: string;
  tipo: string;
  valore: Record<string, string> | null;
}): InfoImportanteFormValues {
  const v = record.valore ?? {};
  return {
    titolo: record.titolo,
    tipo: (record.tipo as InfoImportanteFormValues["tipo"]) ?? "scuola",
    telefono: v.telefono ?? "",
    indirizzo: v.indirizzo ?? "",
    contenuto: v.contenuto ?? "",
  };
}
