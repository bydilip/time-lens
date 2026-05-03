import { jdFromRd, rdFromJd } from "../pivot";
import type { CalendarAdapter } from "../types";
import { COPTIC_EPOCH, copticFromRd, rdFromCoptic } from "./coptic";

type EthiopicFields = { y: number; m: number; d: number };

const ETHIOPIC_EPOCH = 2796; // RD of 29 Aug 8 CE Julian

export const ETHIOPIC_MONTH_NAMES = [
  "", "Maskaram", "Teqemt", "Hedar", "Takhsas", "Ter", "Yakatit",
  "Magabit", "Miyazya", "Genbot", "Sane", "Hamle", "Nahase", "Paguemen",
];

export function rdFromEthiopic(y: number, m: number, d: number): number {
  return ETHIOPIC_EPOCH + (rdFromCoptic(y, m, d) - COPTIC_EPOCH);
}

export function ethiopicFromRd(rd: number): EthiopicFields {
  return copticFromRd(rd + COPTIC_EPOCH - ETHIOPIC_EPOCH);
}

export const ethiopic: CalendarAdapter<EthiopicFields> = {
  id: "ethiopic",
  label: "Ethiopic",
  schema: [
    { name: "y", label: "Year", kind: "year" },
    { name: "m", label: "Month", kind: "month" },
    { name: "d", label: "Day", kind: "day" },
  ],
  monthNames: ETHIOPIC_MONTH_NAMES.slice(1),
  toJd: ({ y, m, d }) => jdFromRd(rdFromEthiopic(y, m, d)),
  fromJd: (jd) => ethiopicFromRd(rdFromJd(jd)),
  format: ({ y, m, d }) => `${d} ${ETHIOPIC_MONTH_NAMES[m] ?? `M${m}`} ${y} EC`,
};
