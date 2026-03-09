import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

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
    /** Optional unique identifier for login lookup (avoids iterating all users) */
    loginIdentifier: text("login_identifier"),
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
    loginIdentifierUnique: unique().on(table.loginIdentifier),
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
  luogo: text("luogo"),
  creatoIl: text("creato_il")
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
  modificatoIl: text("modificato_il")
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
});

/** Info type: scuola | medico | altro */
const infoImportantiTipoValues = ["scuola", "medico", "altro"] as const;

/**
 * Info importanti table - shared important info (school, doctor, etc.).
 * creatoDa references utenti.id. valore stores JSON (telefono, indirizzo, contenuto).
 */
export const infoImportanti = sqliteTable("info_importanti", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  titolo: text("titolo").notNull(),
  tipo: text("tipo", { enum: infoImportantiTipoValues }).notNull(),
  valore: text("valore"), // JSON
  pinned: integer("pinned", { mode: "boolean" }).$defaultFn(() => false).notNull(),
  pinnedAt: text("pinned_at"),
  creatoDa: text("creato_da")
    .notNull()
    .references(() => utenti.id),
  creatoIl: text("creato_il")
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
  modificatoIl: text("modificato_il")
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
});

/** Notification type enum */
const notificaTipoValues = [
  "evento_aggiunto",
  "evento_modificato",
  "evento_eliminato",
  "info_aggiunta",
  "info_modificata",
  "info_eliminata",
] as const;

/** Entity type for notifications */
const notificaEntityTypeValues = ["evento", "info_importante"] as const;

/**
 * Notifications table - per-user notifications for events and info changes.
 */
export const notifiche = sqliteTable("notifiche", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  utenteId: text("utente_id")
    .notNull()
    .references(() => utenti.id),
  tipo: text("tipo", { enum: notificaTipoValues }).notNull(),
  entityType: text("entity_type", { enum: notificaEntityTypeValues }).notNull(),
  entityId: text("entity_id"),
  titolo: text("titolo").notNull(),
  autoreId: text("autore_id")
    .notNull()
    .references(() => utenti.id),
  letta: integer("letta", { mode: "boolean" }).$defaultFn(() => false).notNull(),
  creatoIl: text("creato_il")
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
