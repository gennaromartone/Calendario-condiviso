/**
 * Domain types for repositories.
 * Keeps infrastructure-agnostic representations.
 */

export type UserWithProfile = {
  id: string;
  nome: string | null;
  affidamentoColore: string | null;
};

export type UserWithPasswordHash = UserWithProfile & {
  passwordHash: string;
  creatoIl?: string;
};


export type EventWithCreator = {
  id: string;
  titolo: string;
  descrizione: string | null;
  dataInizio: string;
  dataFine: string;
  tipo: "affidamento" | "scuola" | "sport" | "altro";
  note: { general?: string; byDay?: Record<string, string> } | null;
  luogo: string | null;
  creatoDa: string;
  creatoIl: string;
  modificatoIl: string;
  creatore: { nome: string | null; affidamentoColore: string | null } | null;
};

export type CreateEventData = {
  titolo: string;
  descrizione?: string | null;
  dataInizio: string;
  dataFine: string;
  tipo: "affidamento" | "scuola" | "sport" | "altro";
  note?: string | null;
  luogo?: string | null;
  creatoDa: string;
};

export type EventNotes = {
  general?: string;
  byDay?: Record<string, string>;
};

export type UpdateEventData = Partial<
  Omit<CreateEventData, "creatoDa" | "note">
> & {
  note?: EventNotes | null;
};
