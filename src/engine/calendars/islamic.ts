import { jdFromRd, mod, quotient, rdFromJd } from "../pivot";
import type { CalendarAdapter } from "../types";

type IslamicFields = { y: number; m: number; d: number };

const ISLAMIC_EPOCH = 227015; // RD of 16 July 622 CE Julian (1 Muharram AH 1)

export const ISLAMIC_MONTH_NAMES = [
  "", "Muharram", "Safar", "Rabi al-Awwal", "Rabi ath-Thani",
  "Jumada al-Awwal", "Jumada ath-Thaniyah", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qa'dah", "Dhu al-Hijjah",
];

export function islamicLeap(y: number): boolean {
  return mod(14 + 11 * y, 30) < 11;
}

export function rdFromIslamic(y: number, m: number, d: number): number {
  return (
    ISLAMIC_EPOCH - 1 +
    (y - 1) * 354 +
    quotient(3 + 11 * y, 30) +
    29 * (m - 1) +
    quotient(m, 2) +
    d
  );
}

export function islamicFromRd(rd: number): IslamicFields {
  const y = quotient(30 * (rd - ISLAMIC_EPOCH) + 10646, 10631);
  const priorDays = rd - rdFromIslamic(y, 1, 1);
  const m = quotient(11 * priorDays + 330, 325);
  const d = rd - rdFromIslamic(y, m, 1) + 1;
  return { y, m, d };
}

export const islamic: CalendarAdapter<IslamicFields> = {
  id: "islamic",
  label: "Islamic",
  schema: [
    { name: "y", label: "Year", kind: "year" },
    { name: "m", label: "Month", kind: "month" },
    { name: "d", label: "Day", kind: "day" },
  ],
  monthNames: ISLAMIC_MONTH_NAMES.slice(1),
  toJd: ({ y, m, d }) => jdFromRd(rdFromIslamic(y, m, d)),
  fromJd: (jd) => islamicFromRd(rdFromJd(jd)),
  format: ({ y, m, d }) => `${d} ${ISLAMIC_MONTH_NAMES[m] ?? `M${m}`} ${y} AH`,
  validRange: { minJd: 1948440 },
};
