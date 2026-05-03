// JD <-> RD pivot. RD = Rata Die (days since proleptic Gregorian Jan 1, 1 AD).
// All calendrical math runs in RD (integer); JD is the public pivot.
// JD 1721426 (noon) = Jan 1, 1 AD Gregorian = RD 1.

export const RD_EPOCH_JD = 1721425;

export const rdFromJd = (jd: number): number => jd - RD_EPOCH_JD;
export const jdFromRd = (rd: number): number => rd + RD_EPOCH_JD;

// Mathematical mod (always >= 0) and floor division — the legacy file
// relies on these semantics throughout.
export const mod = (a: number, b: number): number => ((a % b) + b) % b;
export const quotient = (a: number, b: number): number => Math.floor(a / b);

// 0 = Sunday .. 6 = Saturday (matches mock + ISO convention).
export const dayOfWeekFromJd = (jd: number): 0 | 1 | 2 | 3 | 4 | 5 | 6 =>
  mod(jd + 1, 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const dayOfWeekFromRd = (rd: number): number => mod(rd, 7);

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
