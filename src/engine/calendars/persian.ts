import { jdFromRd, mod, quotient, rdFromJd } from "../pivot";
import type { CalendarAdapter } from "../types";

type PersianFields = { y: number; m: number; d: number };

const PERSIAN_EPOCH = 226896; // RD of 19 March 622 CE Julian

export const PERSIAN_MONTH_NAMES = [
  "", "Farvardin", "Ordibehesht", "Khordad", "Tir", "Mordad", "Shahrivar",
  "Mehr", "Aban", "Azar", "Dey", "Bahman", "Esfand",
];

// Birashk's arithmetic algorithm — matches astronomical Persian for years
// 1244-1644 AP (1865-2265 CE). Off by ~1 day at extremes; standard for software.
export function persianLeap(y: number): boolean {
  const epyear = y > 0 ? y - 474 : y - 473;
  const year = mod(epyear, 2820) + 474;
  return mod((year + 38) * 31, 128) < 31;
}

export function rdFromPersian(y: number, m: number, d: number): number {
  const epyear = y > 0 ? y - 474 : y - 473;
  const year = mod(epyear, 2820) + 474;
  const monthDays = m <= 7 ? 31 * (m - 1) : 30 * (m - 1) + 6;
  return (
    PERSIAN_EPOCH - 1 +
    1029983 * quotient(epyear, 2820) +
    365 * (year - 1) +
    quotient(31 * year - 5, 128) +
    monthDays +
    d
  );
}

export function persianFromRd(rd: number): PersianFields {
  const newYear = (() => {
    const days = rd - rdFromPersian(475, 1, 1);
    const cycle = quotient(days, 1029983);
    const cyear = mod(days, 1029983);
    const ycycle =
      cyear === 1029982
        ? 2820
        : quotient(128 * cyear + 46878, 46751);
    let year = ycycle + 2820 * cycle + 474;
    if (year <= 0) year -= 1;
    return year;
  })();

  const y = newYear;
  const dayOfYear = rd - rdFromPersian(y, 1, 1) + 1;
  const m = dayOfYear <= 186 ? Math.ceil(dayOfYear / 31) : Math.ceil((dayOfYear - 6) / 30);
  const d = rd - rdFromPersian(y, m, 1) + 1;
  return { y, m, d };
}

export const persian: CalendarAdapter<PersianFields> = {
  id: "persian",
  label: "Persian",
  schema: [
    { name: "y", label: "Year", kind: "year" },
    { name: "m", label: "Month", kind: "month" },
    { name: "d", label: "Day", kind: "day" },
  ],
  monthNames: PERSIAN_MONTH_NAMES.slice(1),
  toJd: ({ y, m, d }) => jdFromRd(rdFromPersian(y, m, d)),
  fromJd: (jd) => persianFromRd(rdFromJd(jd)),
  format: ({ y, m, d }) => `${d} ${PERSIAN_MONTH_NAMES[m] ?? `M${m}`} ${y} AP`,
};
