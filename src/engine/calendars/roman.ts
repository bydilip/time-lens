import { jdFromRd, rdFromJd } from "../pivot";
import type { CalendarAdapter } from "../types";
import { julianFromRd, julianLeap } from "./julian";

type RomanFields = { text: string };

const KAL_NAMES = [
  "Ian.", "Feb.", "Mart.", "Apr.", "Mai.", "Iun.",
  "Iul.", "Aug.", "Sept.", "Oct.", "Nov.", "Dec.",
];

function romanNumeral(n: number): string {
  const map: Array<[number, string]> = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let s = "";
  for (const [v, sym] of map) {
    while (n >= v) {
      s += sym;
      n -= v;
    }
  }
  return s;
}

function nonesIdes(month: number): { nones: number; ides: number } {
  const longMonths = [3, 5, 7, 10];
  return longMonths.includes(month)
    ? { nones: 7, ides: 15 }
    : { nones: 5, ides: 13 };
}

function lastDayOfJulianMonth(y: number, m: number): number {
  if (m === 2) return julianLeap(y) ? 29 : 28;
  return [4, 6, 9, 11].includes(m) ? 30 : 31;
}

export function romanTextFromJulian(y: number, m: number, d: number): string {
  const auc = y + 753; // ab urbe condita
  const aucRoman = romanNumeral(auc);
  const { nones, ides } = nonesIdes(m);

  const fmt = (count: number, ref: string, monthIdx: number): string => {
    const nm = KAL_NAMES[monthIdx];
    if (count === 1) return `${ref}. ${nm} ${aucRoman} AUC`;
    if (count === 2) return `pridie ${ref}. ${nm} ${aucRoman} AUC`;
    return `ante diem ${romanNumeral(count)} ${ref}. ${nm} ${aucRoman} AUC`;
  };

  if (d === 1) return fmt(1, "Kal.", m - 1);
  if (d < nones) return fmt(nones - d + 1, "Non.", m - 1);
  if (d === nones) return fmt(1, "Non.", m - 1);
  if (d < ides) return fmt(ides - d + 1, "Id.", m - 1);
  if (d === ides) return fmt(1, "Id.", m - 1);

  const lastDay = lastDayOfJulianMonth(y, m);
  const daysToNextKal = lastDay - d + 2;
  const nextMonth = m === 12 ? 0 : m;
  return fmt(daysToNextKal, "Kal.", nextMonth);
}

export const roman: CalendarAdapter<RomanFields> = {
  id: "roman",
  label: "Roman",
  schema: [{ name: "text", label: "Roman date", kind: "text" }],
  toJd: () => {
    throw new Error("Roman calendar is output-only");
  },
  fromJd: (jd) => {
    const j = julianFromRd(rdFromJd(jd));
    return { text: romanTextFromJulian(j.y, j.m, j.d) };
  },
  format: ({ text }) => text,
  validRange: { minJd: 1723980 },
};
