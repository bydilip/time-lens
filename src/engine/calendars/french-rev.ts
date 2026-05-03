import { jdFromRd, mod, quotient, rdFromJd } from "../pivot";
import type { CalendarAdapter } from "../types";

type FrenchFields = { y: number; m: number; d: number };

const FRENCH_EPOCH = 654415; // RD of 22 Sep 1792 (Vendémiaire 1, Year I)

export const FRENCH_MONTH_NAMES = [
  "", "Vendémiaire", "Brumaire", "Frimaire", "Nivôse", "Pluviôse", "Ventôse",
  "Germinal", "Floréal", "Prairial", "Messidor", "Thermidor", "Fructidor",
  "Sansculottides",
];

// Original arithmetic rule (used by the legacy file): leap every 4th year of
// the era. Romme's rule (Gregorian-style centuries) is more accurate but never
// applied historically.
export function frenchLeap(y: number): boolean {
  return mod(y, 4) === 0;
}

export function rdFromFrench(y: number, m: number, d: number): number {
  return FRENCH_EPOCH - 1 + 365 * (y - 1) + quotient(y, 4) + 30 * (m - 1) + d;
}

export function frenchFromRd(rd: number): FrenchFields {
  const y = quotient(4 * (rd - FRENCH_EPOCH) + 1463, 1461);
  const m = quotient(rd - rdFromFrench(y, 1, 1), 30) + 1;
  const d = rd + 1 - rdFromFrench(y, m, 1);
  return { y, m, d };
}

export const frenchRev: CalendarAdapter<FrenchFields> = {
  id: "french-rev",
  label: "French Revolutionary",
  schema: [
    { name: "y", label: "Year", kind: "year" },
    { name: "m", label: "Month", kind: "month" },
    { name: "d", label: "Day", kind: "day" },
  ],
  monthNames: FRENCH_MONTH_NAMES.slice(1),
  toJd: ({ y, m, d }) => jdFromRd(rdFromFrench(y, m, d)),
  fromJd: (jd) => frenchFromRd(rdFromJd(jd)),
  format: ({ y, m, d }) => `${d} ${FRENCH_MONTH_NAMES[m] ?? `M${m}`} ${y}`,
};
