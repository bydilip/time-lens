import { jdFromRd, mod, quotient, rdFromJd } from "../pivot";
import type { CalendarAdapter } from "../types";

type EgyptianFields = { y: number; m: number; d: number };

// Nabonassar era: Feb 26, 747 BCE Julian.
const EGYPTIAN_EPOCH = -272787;

export const EGYPTIAN_MONTH_NAMES = [
  "", "Thoth", "Phaophi", "Athyr", "Choiak", "Tybi", "Mecheir",
  "Phamenoth", "Pharmuthi", "Pachon", "Payni", "Epeiph", "Mesori", "Epagomenae",
];

const SEASONS = ["Inundation", "Inundation", "Inundation", "Inundation", "Winter", "Winter", "Winter", "Winter", "Summer", "Summer", "Summer", "Summer", "Epagomenae"];

export function rdFromEgyptian(y: number, m: number, d: number): number {
  return EGYPTIAN_EPOCH + 365 * (y - 1) + 30 * (m - 1) + d - 1;
}

export function egyptianFromRd(rd: number): EgyptianFields {
  const days = rd - EGYPTIAN_EPOCH;
  const y = quotient(days, 365) + 1;
  const r = mod(days, 365);
  const m = quotient(r, 30) + 1;
  const d = mod(r, 30) + 1;
  return { y, m, d };
}

export function egyptianSeason(m: number): string {
  return SEASONS[m - 1] ?? "";
}

export const egyptian: CalendarAdapter<EgyptianFields> = {
  id: "egyptian",
  label: "Ancient Egyptian",
  schema: [
    { name: "y", label: "Year", kind: "year" },
    { name: "m", label: "Month", kind: "month" },
    { name: "d", label: "Day", kind: "day" },
  ],
  monthNames: EGYPTIAN_MONTH_NAMES.slice(1),
  toJd: ({ y, m, d }) => jdFromRd(rdFromEgyptian(y, m, d)),
  fromJd: (jd) => egyptianFromRd(rdFromJd(jd)),
  format: ({ y, m, d }) => `${d} ${EGYPTIAN_MONTH_NAMES[m] ?? `M${m}`} ${y}`,
};
