import { describe, it } from "node:test";
import assert from "node:assert";
import {
  hasNotesForDate,
  toDateKey,
  getWeekStart,
  getWeekDates,
  getEventDateKeys,
  getMonthGrid,
} from "../calendar-utils";

describe("calendar-utils", () => {
  describe("hasNotesForDate", () => {
    it("returns false when event has no notes", () => {
      const event = { note: undefined } as Parameters<typeof hasNotesForDate>[0];
      assert.strictEqual(hasNotesForDate(event, "2025-01-15"), false);
    });

    it("returns true when event has general notes", () => {
      const event = {
        note: { general: "Some note" },
      } as Parameters<typeof hasNotesForDate>[0];
      assert.strictEqual(hasNotesForDate(event, "2025-01-15"), true);
    });

    it("returns true when event has byDay notes for the date", () => {
      const event = {
        note: { byDay: { "2025-01-15": "Day note" } },
      } as Parameters<typeof hasNotesForDate>[0];
      assert.strictEqual(hasNotesForDate(event, "2025-01-15"), true);
    });

    it("returns false when byDay has no note for the date", () => {
      const event = {
        note: { byDay: { "2025-01-14": "Other day" } },
      } as Parameters<typeof hasNotesForDate>[0];
      assert.strictEqual(hasNotesForDate(event, "2025-01-15"), false);
    });
  });

  describe("toDateKey", () => {
    it("formats date as YYYY-MM-DD", () => {
      assert.strictEqual(toDateKey(new Date(2025, 0, 15)), "2025-01-15");
      assert.strictEqual(toDateKey(new Date(2025, 11, 1)), "2025-12-01");
    });
  });

  describe("getWeekStart", () => {
    it("returns Monday for a Wednesday", () => {
      const wed = new Date(2025, 0, 15); // Wed Jan 15
      const mon = getWeekStart(wed);
      assert.strictEqual(mon.getDay(), 1); // Monday
      assert.strictEqual(mon.getDate(), 13);
    });

    it("returns Monday for a Sunday", () => {
      const sun = new Date(2025, 0, 12); // Sun Jan 12
      const mon = getWeekStart(sun);
      assert.strictEqual(mon.getDay(), 1);
      assert.strictEqual(mon.getDate(), 6); // Mon Jan 6
    });
  });

  describe("getWeekDates", () => {
    it("returns 7 dates starting from week start", () => {
      const mon = new Date(2025, 0, 6); // Mon
      const dates = getWeekDates(mon);
      assert.strictEqual(dates.length, 7);
      assert.strictEqual(dates[0].getDay(), 1);
      assert.strictEqual(dates[6].getDay(), 0); // Sunday
    });
  });

  describe("getEventDateKeys", () => {
    it("returns single date when start equals end", () => {
      const keys = getEventDateKeys({
        dataInizio: "2025-01-15T09:00:00.000Z",
        dataFine: "2025-01-15T17:00:00.000Z",
      });
      assert.deepStrictEqual(keys, ["2025-01-15"]);
    });

    it("returns all dates in range", () => {
      const keys = getEventDateKeys({
        dataInizio: "2025-01-15T12:00:00.000Z",
        dataFine: "2025-01-17T12:00:00.000Z",
      });
      assert.deepStrictEqual(keys, ["2025-01-15", "2025-01-16", "2025-01-17"]);
    });
  });

  describe("getMonthGrid", () => {
    it("returns 42 cells for a month", () => {
      const grid = getMonthGrid(2025, 1); // January 2025
      assert.strictEqual(grid.length, 42);
    });

    it("marks current month cells correctly", () => {
      const grid = getMonthGrid(2025, 3); // March 2025
      const marchCells = grid.filter((c) => c.isCurrentMonth);
      assert.ok(marchCells.length >= 28 && marchCells.length <= 31);
    });
  });
});
