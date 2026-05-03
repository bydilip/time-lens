import { jdFromRd, mod, quotient, rdFromJd } from "../pivot";
import type { CalendarAdapter } from "../types";

type CopticFields = { y: number; m: number; d: number };

export const COPTIC_EPOCH = 103605; // RD of 29 Aug 284 CE Julian (Diocletian era)

export const COPTIC_MONTH_NAMES = [
  "", "Thout", "Paopi", "Hathor", "Koiak", "Tobi", "Meshir",
  "Paremhat", "Paremoude", "Pashons", "Paoni", "Epip", "Mesori", "Pi Kogi Enavot",
];

export function copticLeap(y: number): boolean {
  return mod(y, 4) === 3;
}

export function rdFromCoptic(y: number, m: number, d: number): number {
  return COPTIC_EPOCH - 1 + 365 * (y - 1) + quotient(y, 4) + 30 * (m - 1) + d;
}

export function copticFromRd(rd: number): CopticFields {
  const y = quotient(4 * (rd - COPTIC_EPOCH) + 1463, 1461);
  const m = quotient(rd - rdFromCoptic(y, 1, 1), 30) + 1;
  const d = rd + 1 - rdFromCoptic(y, m, 1);
  return { y, m, d };
}

export const coptic: CalendarAdapter<CopticFields> = {
  id: "coptic",
  label: "Coptic",
  schema: [
    { name: "y", label: "Year", kind: "year" },
    { name: "m", label: "Month", kind: "month" },
    { name: "d", label: "Day", kind: "day" },
  ],
  monthNames: COPTIC_MONTH_NAMES.slice(1),
  toJd: ({ y, m, d }) => jdFromRd(rdFromCoptic(y, m, d)),
  fromJd: (jd) => copticFromRd(rdFromJd(jd)),
  format: ({ y, m, d }) => `${d} ${COPTIC_MONTH_NAMES[m] ?? `M${m}`} ${y} AM`,
  validRange: { minJd: 1824665 },
};
