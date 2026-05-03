import { jdFromRd, mod, quotient, rdFromJd } from "../pivot";
import type { CalendarAdapter } from "../types";
import { MONTH_NAMES } from "./gregorian";

type JulianFields = { y: number; m: number; d: number };

const JULIAN_EPOCH = -1; // RD of Jan 1, 1 AD Julian

export function julianLeap(y: number): boolean {
  return mod(y, 4) === (y > 0 ? 0 : 3);
}

export function rdFromJulian(y: number, m: number, d: number): number {
  const yp = y < 0 ? y + 1 : y; // skip year 0
  const correction = m <= 2 ? 0 : julianLeap(y) ? -1 : -2;
  return (
    JULIAN_EPOCH - 1 +
    365 * (yp - 1) +
    quotient(yp - 1, 4) +
    quotient(367 * m - 362, 12) +
    correction +
    d
  );
}

export function julianFromRd(rd: number): JulianFields {
  const approx = quotient(4 * (rd - JULIAN_EPOCH) + 1464, 1461);
  const year = approx <= 0 ? approx - 1 : approx;
  const priorDays = rd - rdFromJulian(year, 1, 1);
  const correction =
    rd < rdFromJulian(year, 3, 1) ? 0 : julianLeap(year) ? 1 : 2;
  const month = quotient(12 * (priorDays + correction) + 373, 367);
  const day = rd - rdFromJulian(year, month, 1) + 1;
  return { y: year, m: month, d: day };
}

export const julian: CalendarAdapter<JulianFields> = {
  id: "julian",
  label: "Julian",
  schema: [
    { name: "y", label: "Year", kind: "year" },
    { name: "m", label: "Month", kind: "month" },
    { name: "d", label: "Day", kind: "day" },
  ],
  monthNames: MONTH_NAMES,
  toJd: ({ y, m, d }) => jdFromRd(rdFromJulian(y, m, d)),
  fromJd: (jd) => julianFromRd(rdFromJd(jd)),
  format: ({ y, m, d }) =>
    `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
};
