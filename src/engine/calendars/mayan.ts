import { jdFromRd, mod, quotient, rdFromJd } from "../pivot";
import type { CalendarAdapter } from "../types";

type MayanFields = { baktun: number; katun: number; tun: number; uinal: number; kin: number };

const MAYAN_EPOCH = -1137142; // RD of 11 Aug 3114 BCE Julian (GMT correlation 584283)
const MAYAN_HAAB_EPOCH = MAYAN_EPOCH - 348; // 18 Cumku before Long Count epoch
const MAYAN_TZOLKIN_EPOCH = MAYAN_EPOCH - 159; // 4 Ahau (1 day before)

export const TZOLKIN_NAMES = [
  "Imix", "Ik", "Akbal", "Kan", "Chicchan", "Cimi", "Manik", "Lamat",
  "Muluc", "Oc", "Chuen", "Eb", "Ben", "Ix", "Men", "Cib",
  "Caban", "Etznab", "Cauac", "Ahau",
];

export const HAAB_NAMES = [
  "Pop", "Uo", "Zip", "Zotz", "Tzec", "Xul", "Yaxkin", "Mol",
  "Chen", "Yax", "Zac", "Ceh", "Mac", "Kankin", "Muan", "Pax",
  "Kayab", "Cumku", "Uayeb",
];

export function rdFromMayan(b: number, k: number, t: number, u: number, kin: number): number {
  return MAYAN_EPOCH + b * 144000 + k * 7200 + t * 360 + u * 20 + kin;
}

export function mayanFromRd(rd: number): MayanFields {
  const long = rd - MAYAN_EPOCH;
  const baktun = quotient(long, 144000);
  const r1 = mod(long, 144000);
  const katun = quotient(r1, 7200);
  const r2 = mod(r1, 7200);
  const tun = quotient(r2, 360);
  const r3 = mod(r2, 360);
  const uinal = quotient(r3, 20);
  const kin = mod(r3, 20);
  return { baktun, katun, tun, uinal, kin };
}

export function mayanTzolkinFromRd(rd: number): { number: number; name: string } {
  const c = rd - MAYAN_TZOLKIN_EPOCH;
  const number = mod(c, 13) + 1;
  const idx = mod(c - 1, 20);
  return { number, name: TZOLKIN_NAMES[idx] };
}

export function mayanHaabFromRd(rd: number): { day: number; month: string } {
  const c = mod(rd - MAYAN_HAAB_EPOCH, 365);
  const day = mod(c, 20);
  const monthIdx = quotient(c, 20);
  return { day, month: HAAB_NAMES[monthIdx] };
}

export const mayan: CalendarAdapter<MayanFields> = {
  id: "mayan-lc",
  label: "Mayan Long Count",
  schema: [
    { name: "baktun", label: "Baktun", kind: "int" },
    { name: "katun", label: "Katun", kind: "int" },
    { name: "tun", label: "Tun", kind: "int" },
    { name: "uinal", label: "Uinal", kind: "int" },
    { name: "kin", label: "Kin", kind: "int" },
  ],
  toJd: ({ baktun, katun, tun, uinal, kin }) =>
    jdFromRd(rdFromMayan(baktun, katun, tun, uinal, kin)),
  fromJd: (jd) => mayanFromRd(rdFromJd(jd)),
  format: ({ baktun, katun, tun, uinal, kin }) =>
    `${baktun}.${katun}.${tun}.${uinal}.${kin}`,
  validRange: { minJd: 584283, maxJd: 58184282 },
};
