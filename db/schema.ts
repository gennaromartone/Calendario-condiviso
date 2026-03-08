import { sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

/**
 * Users table - each parent has their own password.
 */
export const utenti = sqliteTable(
  "utenti",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    passwordHash: text("password_hash").notNull(),
    nome: text("nome"),
    affidamentoColore: text("affidamento_colore"),
    creatoIl: text("creato_il")
      .$defaultFn(() => new Date().toISOString())
      .notNull(),
    modificatoIl: text("modificato_il")
      .$defaultFn(() => new Date().toISOString())
      .notNull(),
  },
  (table) => ({
    affidamentoColoreUnique: unique().on(table.affidamentoColore),
  })
);

/** Event type: affidamento | scuola | sport | altro */
const eventoTipoValues = ["affidamento", "scuola", "sport", "altro"] as const;

/**
 * Events table - calendar events.
 * creatoDa is required and references utenti.id.
 */
export const eventi = sqliteTable("eventi", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  titolo: text("titolo").notNull(),
  descrizione: text("descrizione"),
  dataInizio: text("data_inizio").notNull(),
  dataFine: text("data_fine").notNull(),
  tipo: text("tipo", { enum: eventoTipoValues }).notNull(),
  creatoDa: text("creato_da")
    .notNull()
    .references(() => utenti.id),
  note: text("note"),
  creatoIl: text("creato_il")
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
  modificatoIl: text("modificato_il")
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
});

/**
 * Config/settings table - single row for app-wide settings.
 * Simplified: no password (auth is per-user via utenti).
 */
export const config = sqliteTable("config", {
  id: text("id").primaryKey().default("default"),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});
