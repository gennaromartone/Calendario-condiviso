import { describe, it } from "node:test";
import assert from "node:assert";
import {
  createEventSchema,
  updateEventSchema,
  eventFormSchema,
  eventFormToApiPayload,
} from "../events";

describe("events validation", () => {
  describe("createEventSchema", () => {
    it("accepts valid event input", () => {
      const result = createEventSchema.safeParse({
        titolo: "Test",
        dataInizio: "2025-01-15T09:00:00.000Z",
        dataFine: "2025-01-15T17:00:00.000Z",
        tipo: "affidamento",
      });
      assert.strictEqual(result.success, true);
    });

    it("rejects empty titolo", () => {
      const result = createEventSchema.safeParse({
        titolo: "",
        dataInizio: "2025-01-15T09:00:00.000Z",
        dataFine: "2025-01-15T17:00:00.000Z",
        tipo: "affidamento",
      });
      assert.strictEqual(result.success, false);
    });

    it("rejects invalid tipo", () => {
      const result = createEventSchema.safeParse({
        titolo: "Test",
        dataInizio: "2025-01-15T09:00:00.000Z",
        dataFine: "2025-01-15T17:00:00.000Z",
        tipo: "invalid",
      });
      assert.strictEqual(result.success, false);
    });

    it("rejects titolo over 255 chars", () => {
      const result = createEventSchema.safeParse({
        titolo: "a".repeat(256),
        dataInizio: "2025-01-15T09:00:00.000Z",
        dataFine: "2025-01-15T17:00:00.000Z",
        tipo: "affidamento",
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe("updateEventSchema", () => {
    it("accepts partial input", () => {
      const result = updateEventSchema.safeParse({
        titolo: "Updated",
      });
      assert.strictEqual(result.success, true);
    });

    it("accepts empty object", () => {
      const result = updateEventSchema.safeParse({});
      assert.strictEqual(result.success, true);
    });
  });

  describe("eventFormSchema", () => {
    it("rejects when end date is before start date", () => {
      const result = eventFormSchema.safeParse({
        titolo: "Test",
        dataInizioDate: "2025-01-15",
        dataInizioTime: "17:00",
        dataFineDate: "2025-01-15",
        dataFineTime: "09:00",
        tipo: "affidamento",
      });
      assert.strictEqual(result.success, false);
    });

    it("accepts valid form input", () => {
      const result = eventFormSchema.safeParse({
        titolo: "Test",
        dataInizioDate: "2025-01-15",
        dataInizioTime: "09:00",
        dataFineDate: "2025-01-15",
        dataFineTime: "17:00",
        tipo: "affidamento",
      });
      assert.strictEqual(result.success, true);
    });
  });

  describe("eventFormToApiPayload", () => {
    it("converts form values to API payload", () => {
      const payload = eventFormToApiPayload({
        titolo: "Test",
        dataInizioDate: "2025-01-15",
        dataInizioTime: "09:00",
        dataFineDate: "2025-01-15",
        dataFineTime: "17:00",
        tipo: "affidamento",
      });
      assert.strictEqual(payload.titolo, "Test");
      assert.ok(payload.dataInizio.startsWith("2025-01-15"));
      assert.ok(payload.dataFine.startsWith("2025-01-15"));
      assert.strictEqual(payload.tipo, "affidamento");
    });

    it("includes note when noteGeneral is provided", () => {
      const payload = eventFormToApiPayload({
        titolo: "Test",
        dataInizioDate: "2025-01-15",
        dataInizioTime: "09:00",
        dataFineDate: "2025-01-15",
        dataFineTime: "17:00",
        tipo: "affidamento",
        noteGeneral: "Some note",
      });
      assert.deepStrictEqual(payload.note, { general: "Some note" });
    });
  });
});
