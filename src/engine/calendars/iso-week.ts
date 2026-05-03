import { jdFromRd, mod, quotient, rdFromJd } from "../pivot";
import type { CalendarAdapter } from "../types";
import { gregorianYearFromRd, rdFromGregorian } from "./gregorian";

type IsoFields = { y: number; w: number; d: number };

function nthKday(n: number, k: number, rd: number): number {
  // k = day-of-week (0=Sun..6=Sat); returns the n-th occurrence on/after rd.
  const target = mod(k - rd, 7);
  return rd + target + 7 * (n - 1);
}

function rdFromIso(y: number, w: number, d: number): number {
  // ISO week 1 contains Jan 4. ISO day numbering: 1=Mon..7=Sun.
  const jan4 = rdFromGregorian(y, 1, 4);
  // Monday on/before Jan 4:
  const monday1 = jan4 - mod(jan4 - 1, 7);
  return monday1 + 7 * (w - 1) + (d - 1);
}

function isoFromRd(rd: number): IsoFields {
  const approx = gregorianYearFromRd(rd - 3);
  const y = rd >= rdFromIso(approx + 1, 1, 1) ? approx + 1 : approx;
  const w = quotient(rd - rdFromIso(y, 1, 1), 7) + 1;
  const dow = mod(rd - 1, 7) + 1; // 1=Mon..7=Sun
  return { y, w, d: dow };
}

export const isoWeek: CalendarAdapter<IsoFields> = {
  id: "iso-week",
  label: "ISO Week",
  schema: [
    { name: "y", label: "Year", kind: "year" },
    { name: "w", label: "Week", kind: "int" },
    { name: "d", label: "Day", kind: "day" },
  ],
  toJd: ({ y, w, d }) => jdFromRd(rdFromIso(y, w, d)),
  fromJd: (jd) => isoFromRd(rdFromJd(jd)),
  format: ({ y, w, d }) => `${y}-W${String(w).padStart(2, "0")}-${d}`,
};

export { nthKday };
