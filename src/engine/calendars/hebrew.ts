import { jdFromRd, mod, quotient, rdFromJd } from "../pivot";
import type { CalendarAdapter } from "../types";

type HebrewFields = { y: number; m: number; d: number };

const HEBREW_EPOCH = -1373427; // RD of 1 Tishri AM 1

// Months: 1=Nisan ... 6=Av ... 7=Tishri (year start) ... 12=Adar (or Adar I
// in leap years), 13=Adar II in leap years.
export const HEBREW_MONTH_NAMES = [
  "", "Nisan", "Iyar", "Sivan", "Tammuz", "Av", "Elul",
  "Tishri", "Heshvan", "Kislev", "Tevet", "Shevat", "Adar", "Adar II",
];

export function hebrewLeapYear(y: number): boolean {
  return mod(7 * y + 1, 19) < 7;
}

function lastMonthOfHebrewYear(y: number): number {
  return hebrewLeapYear(y) ? 13 : 12;
}

function hebrewElapsedDays(y: number): number {
  const monthsElapsed = quotient(235 * y - 234, 19);
  const partsElapsed = 12084 + 13753 * monthsElapsed;
  const days = 29 * monthsElapsed + quotient(partsElapsed, 25920);
  return mod(3 * (days + 1), 7) < 3 ? days + 1 : days;
}

function yearLengthCorrection(y: number): number {
  const ny0 = hebrewElapsedDays(y - 1);
  const ny1 = hebrewElapsedDays(y);
  const ny2 = hebrewElapsedDays(y + 1);
  if (ny2 - ny1 === 356) return 2;
  if (ny1 - ny0 === 382) return 1;
  return 0;
}

export function hebrewNewYear(y: number): number {
  return HEBREW_EPOCH + hebrewElapsedDays(y) + yearLengthCorrection(y);
}

function daysInHebrewYear(y: number): number {
  return hebrewNewYear(y + 1) - hebrewNewYear(y);
}

function longHeshvan(y: number): boolean {
  return mod(daysInHebrewYear(y), 10) === 5;
}

function shortKislev(y: number): boolean {
  return mod(daysInHebrewYear(y), 10) === 3;
}

function lastDayOfHebrewMonth(y: number, m: number): number {
  if (m === 2 || m === 4 || m === 6 || m === 10 || m === 13) return 29;
  if (m === 12 && !hebrewLeapYear(y)) return 29;
  if (m === 8 && !longHeshvan(y)) return 29;
  if (m === 9 && shortKislev(y)) return 29;
  return 30;
}

export function rdFromHebrew(y: number, m: number, d: number): number {
  let total = hebrewNewYear(y) + d - 1;
  const last = lastMonthOfHebrewYear(y);
  if (m < 7) {
    for (let i = 7; i <= last; i++) total += lastDayOfHebrewMonth(y, i);
    for (let i = 1; i < m; i++) total += lastDayOfHebrewMonth(y, i);
  } else {
    for (let i = 7; i < m; i++) total += lastDayOfHebrewMonth(y, i);
  }
  return total;
}

export function hebrewFromRd(rd: number): HebrewFields {
  const approx = quotient((rd - HEBREW_EPOCH) * 98496, 35975351) + 1;
  let y = approx;
  while (hebrewNewYear(y + 1) <= rd) y++;
  while (hebrewNewYear(y) > rd) y--;

  const start = rd < rdFromHebrew(y, 1, 1) ? 7 : 1;
  let m = start;
  while (rd > rdFromHebrew(y, m, lastDayOfHebrewMonth(y, m))) m++;
  const d = rd - rdFromHebrew(y, m, 1) + 1;
  return { y, m, d };
}

export const hebrew: CalendarAdapter<HebrewFields> = {
  id: "hebrew",
  label: "Hebrew",
  schema: [
    { name: "y", label: "Year", kind: "year" },
    { name: "m", label: "Month", kind: "month" },
    { name: "d", label: "Day", kind: "day" },
  ],
  monthNames: HEBREW_MONTH_NAMES.slice(1),
  toJd: ({ y, m, d }) => jdFromRd(rdFromHebrew(y, m, d)),
  fromJd: (jd) => hebrewFromRd(rdFromJd(jd)),
  format: ({ y, m, d }) => `${d} ${HEBREW_MONTH_NAMES[m] ?? `M${m}`} ${y}`,
};
