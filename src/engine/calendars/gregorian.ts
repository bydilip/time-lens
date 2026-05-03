import { jdFromRd, mod, quotient, rdFromJd } from "../pivot";
import type { CalendarAdapter } from "../types";

type GregFields = { y: number; m: number; d: number };

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function gregorianLeap(y: number): boolean {
  return mod(y, 4) === 0 && (mod(y, 100) !== 0 || mod(y, 400) === 0);
}

export function rdFromGregorian(y: number, m: number, d: number): number {
  const yp = y - 1;
  const correction = m <= 2 ? 0 : gregorianLeap(y) ? -1 : -2;
  return (
    365 * yp +
    quotient(yp, 4) -
    quotient(yp, 100) +
    quotient(yp, 400) +
    quotient(367 * m - 362, 12) +
    correction +
    d
  );
}

export function gregorianYearFromRd(rd: number): number {
  const d0 = rd - 1;
  const n400 = quotient(d0, 146097);
  const d1 = mod(d0, 146097);
  const n100 = quotient(d1, 36524);
  const d2 = mod(d1, 36524);
  const n4 = quotient(d2, 1461);
  const d3 = mod(d2, 1461);
  const n1 = quotient(d3, 365);
  const year = 400 * n400 + 100 * n100 + 4 * n4 + n1;
  return n100 === 4 || n1 === 4 ? year : year + 1;
}

export function gregorianFromRd(rd: number): GregFields {
  const y = gregorianYearFromRd(rd);
  const priorDays = rd - rdFromGregorian(y, 1, 1);
  const correction =
    rd < rdFromGregorian(y, 3, 1) ? 0 : gregorianLeap(y) ? 1 : 2;
  const m = quotient(12 * (priorDays + correction) + 373, 367);
  const d = rd - rdFromGregorian(y, m, 1) + 1;
  return { y, m, d };
}

export const gregorian: CalendarAdapter<GregFields> = {
  id: "gregorian",
  label: "Gregorian",
  schema: [
    { name: "y", label: "Year", kind: "year" },
    { name: "m", label: "Month", kind: "month" },
    { name: "d", label: "Day", kind: "day" },
  ],
  monthNames: MONTH_NAMES,
  toJd: ({ y, m, d }, trace) => {
    const rd = rdFromGregorian(y, m, d);
    trace?.push({
      description: `Gregorian ${y}-${pad(m)}-${pad(d)} → RD ${rd}`,
      from: { y, m, d },
      to: rd,
      rule: "rd_from_gregorian",
    });
    return jdFromRd(rd);
  },
  fromJd: (jd, trace) => {
    const fields = gregorianFromRd(rdFromJd(jd));
    trace?.push({
      description: `JD ${jd} → Gregorian ${fields.y}-${pad(fields.m)}-${pad(fields.d)}`,
      from: jd,
      to: fields,
      rule: "gregorian_from_rd",
    });
    return fields;
  },
  format: ({ y, m, d }) => `${y}-${pad(m)}-${pad(d)}`,
  validRange: { minJd: 2299161 }, // 15 Oct 1582 (start of Gregorian use)
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
