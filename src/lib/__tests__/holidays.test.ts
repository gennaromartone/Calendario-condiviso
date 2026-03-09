import { describe, it } from "node:test";
import assert from "node:assert";
import {
  getEasterSunday,
  getHolidaysForDate,
  getHolidaysForMonth,
} from "../holidays";

describe("holidays", () => {
  describe("getEasterSunday", () => {
    it("returns correct date for 2025", () => {
      const easter = getEasterSunday(2025);
      assert.strictEqual(easter.getFullYear(), 2025);
      assert.strictEqual(easter.getMonth(), 3); // April (0-indexed)
      assert.strictEqual(easter.getDate(), 20);
    });

    it("returns correct date for 2024", () => {
      const easter = getEasterSunday(2024);
      assert.strictEqual(easter.getFullYear(), 2024);
      assert.strictEqual(easter.getMonth(), 2); // March
      assert.strictEqual(easter.getDate(), 31);
    });
  });

  describe("getHolidaysForDate", () => {
    it("returns Capodanno for Jan 1", () => {
      const holidays = getHolidaysForDate(new Date(2025, 0, 1), ["IT"]);
      assert.ok(holidays.some((h) => h.name === "Capodanno" && h.country === "IT"));
    });

    it("returns Natale for Dec 25", () => {
      const holidays = getHolidaysForDate(new Date(2025, 11, 25), ["IT"]);
      assert.ok(holidays.some((h) => h.name === "Natale" && h.country === "IT"));
    });

    it("returns empty for non-holiday date", () => {
      const holidays = getHolidaysForDate(new Date(2025, 0, 15), ["IT"]);
      assert.strictEqual(holidays.length, 0);
    });
  });

  describe("getHolidaysForMonth", () => {
    it("returns map with holiday dates for January", () => {
      const map = getHolidaysForMonth(2025, 1, ["IT"]);
      assert.ok(map.has("2025-01-01")); // Capodanno
      assert.ok(map.has("2025-01-06")); // Epifania
    });

    it("returns map with holiday dates for December", () => {
      const map = getHolidaysForMonth(2025, 12, ["IT"]);
      assert.ok(map.has("2025-12-25")); // Natale
      assert.ok(map.has("2025-12-26")); // S. Stefano
    });
  });
});
