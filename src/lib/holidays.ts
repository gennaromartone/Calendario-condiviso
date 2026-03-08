import {
  addDays,
  getYear,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
} from "date-fns";

export type HolidayCountry = "IT" | "DE";

export interface Holiday {
  name: string;
  country: HolidayCountry;
}

const DEFAULT_COUNTRIES: HolidayCountry[] = ["IT", "DE"];

/**
 * Gauss/Anonymous Gregorian algorithm for Easter Sunday.
 * Valid for all Gregorian calendar years.
 */
export function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function getItalyFixedHolidays(year: number): Array<{ date: Date; name: string }> {
  return [
    { date: new Date(year, 0, 1), name: "Capodanno" },
    { date: new Date(year, 0, 6), name: "Epifania" },
    { date: new Date(year, 3, 25), name: "Liberazione" },
    { date: new Date(year, 4, 1), name: "Festa Lavoro" },
    { date: new Date(year, 5, 2), name: "Festa Repubblica" },
    { date: new Date(year, 7, 15), name: "Ferragosto" },
    { date: new Date(year, 10, 1), name: "Ognissanti" },
    { date: new Date(year, 11, 8), name: "Immacolata" },
    { date: new Date(year, 11, 25), name: "Natale" },
    { date: new Date(year, 11, 26), name: "S. Stefano" },
  ];
}

function getItalyMobileHolidays(year: number): Array<{ date: Date; name: string }> {
  const easter = getEasterSunday(year);
  return [
    { date: easter, name: "Pasqua" },
    { date: addDays(easter, 1), name: "Lunedì dell'Angelo" },
  ];
}

function getGermanyFixedHolidays(year: number): Array<{ date: Date; name: string }> {
  return [
    { date: new Date(year, 0, 1), name: "Neujahr" },
    { date: new Date(year, 0, 6), name: "Heilige Drei Könige" },
    { date: new Date(year, 4, 1), name: "Tag der Arbeit" },
    { date: new Date(year, 9, 3), name: "Tag der Deutschen Einheit" },
    { date: new Date(year, 11, 25), name: "Weihnachten" },
    { date: new Date(year, 11, 26), name: "Weihnachten" },
  ];
}

function getGermanyMobileHolidays(year: number): Array<{ date: Date; name: string }> {
  const easter = getEasterSunday(year);
  return [
    { date: addDays(easter, -2), name: "Karfreitag" },
    { date: addDays(easter, 1), name: "Ostermontag" },
    { date: addDays(easter, 39), name: "Christi Himmelfahrt" },
    { date: addDays(easter, 50), name: "Pfingstmontag" },
  ];
}

function getAllHolidaysForYear(
  year: number,
  countries: HolidayCountry[]
): Array<{ date: Date; name: string; country: HolidayCountry }> {
  const result: Array<{ date: Date; name: string; country: HolidayCountry }> = [];

  if (countries.includes("IT")) {
    for (const h of getItalyFixedHolidays(year)) {
      result.push({ ...h, country: "IT" });
    }
    for (const h of getItalyMobileHolidays(year)) {
      result.push({ ...h, country: "IT" });
    }
  }

  if (countries.includes("DE")) {
    for (const h of getGermanyFixedHolidays(year)) {
      result.push({ ...h, country: "DE" });
    }
    for (const h of getGermanyMobileHolidays(year)) {
      result.push({ ...h, country: "DE" });
    }
  }

  return result;
}

/**
 * Returns holidays for a specific date.
 */
export function getHolidaysForDate(
  date: Date,
  countries: HolidayCountry[] = DEFAULT_COUNTRIES
): Holiday[] {
  const year = getYear(date);
  const holidays = getAllHolidaysForYear(year, countries);

  return holidays
    .filter((h) => isSameDay(h.date, date))
    .map(({ name, country }) => ({ name, country }));
}

/**
 * Returns a Map of date keys (YYYY-MM-DD) to holidays for the given month.
 * Optimized for rendering monthly grids.
 */
export function getHolidaysForMonth(
  year: number,
  month: number,
  countries: HolidayCountry[] = DEFAULT_COUNTRIES
): Map<string, Holiday[]> {
  const start = startOfMonth(new Date(year, month - 1, 1));
  const end = endOfMonth(start);
  const days = eachDayOfInterval({ start, end });

  const allHolidays = getAllHolidaysForYear(year, countries);
  const map = new Map<string, Holiday[]>();

  for (const day of days) {
    const key = format(day, "yyyy-MM-dd");
    const dayHolidays = allHolidays
      .filter((h) => isSameDay(h.date, day))
      .map(({ name, country }) => ({ name, country }));
    if (dayHolidays.length > 0) {
      map.set(key, dayHolidays);
    }
  }

  return map;
}
