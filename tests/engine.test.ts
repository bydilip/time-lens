// Sanity test for the Time Lens engine. Run with:
//   node --experimental-strip-types tests/engine.test.ts
// (Vitest replaces this once the project scaffold lands in Phase 1.)

import { run } from "../src/engine/index.ts";
import { rdFromGregorian, gregorianFromRd } from "../src/engine/calendars/gregorian.ts";
import { rdFromJulian, julianFromRd } from "../src/engine/calendars/julian.ts";
import { rdFromHebrew, hebrewFromRd } from "../src/engine/calendars/hebrew.ts";
import { rdFromIslamic, islamicFromRd } from "../src/engine/calendars/islamic.ts";
import { rdFromMayan, mayanFromRd } from "../src/engine/calendars/mayan.ts";
import { easterGregorian } from "../src/engine/operations/holidays/easter.ts";

let passed = 0;
let failed = 0;

function eq(label: string, got: unknown, want: unknown): void {
  const a = JSON.stringify(got);
  const b = JSON.stringify(want);
  if (a === b) {
    passed++;
    console.log(`ok ${label}`);
  } else {
    failed++;
    console.log(`FAIL ${label}\n  got  ${a}\n  want ${b}`);
  }
}

// Reference: 2026-05-03 Gregorian = JD 2461164 (noon).
const RD_REF = 739739;
eq("RD from Gregorian 2026-05-03", rdFromGregorian(2026, 5, 3), RD_REF);
eq("Gregorian round-trip 2026-05-03", gregorianFromRd(RD_REF), { y: 2026, m: 5, d: 3 });

// Julian: Oct 5, 1582 Julian = Oct 15, 1582 Gregorian (the Gregorian gap).
eq("Julian 1582-10-05 RD", rdFromJulian(1582, 10, 5), rdFromGregorian(1582, 10, 15));

// Round-trip Gregorian over a wide range.
for (let y = 1; y <= 4000; y += 137) {
  for (const [m, d] of [[1, 1], [2, 28], [3, 1], [12, 31]]) {
    const rd = rdFromGregorian(y, m, d);
    const back = gregorianFromRd(rd);
    if (back.y !== y || back.m !== m || back.d !== d) {
      failed++;
      console.log(`FAIL gregorian round-trip ${y}-${m}-${d} got ${JSON.stringify(back)}`);
    } else passed++;
  }
}

// Hebrew: Pesach 5785 (15 Nisan = month 1, day 15) was 13 April 2025 Gregorian.
const pesach5785 = rdFromHebrew(5785, 1, 15);
eq("Pesach 5785 → 2025-04-13", gregorianFromRd(pesach5785), { y: 2025, m: 4, d: 13 });
const hebRoundTrip = hebrewFromRd(pesach5785);
eq("Hebrew round-trip 5785-01-15", hebRoundTrip, { y: 5785, m: 1, d: 15 });

// Hebrew round-trip over many years.
for (let y = 5700; y <= 5800; y += 7) {
  for (const [m, d] of [[7, 1], [1, 15], [3, 6]]) {
    const rd = rdFromHebrew(y, m, d);
    const back = hebrewFromRd(rd);
    if (back.y !== y || back.m !== m || back.d !== d) {
      failed++;
      console.log(`FAIL hebrew round-trip ${y}-${m}-${d} got ${JSON.stringify(back)}`);
    } else passed++;
  }
}

// Islamic: 1 Muharram 1 AH = 16 July 622 CE Julian.
eq("Islamic epoch", rdFromIslamic(1, 1, 1), rdFromJulian(622, 7, 16));
eq("Islamic round-trip 1447-11-15", islamicFromRd(rdFromIslamic(1447, 11, 15)), {
  y: 1447, m: 11, d: 15,
});

// Mayan epoch (Long Count 0.0.0.0.0 = 11 Aug 3114 BCE Julian).
eq("Mayan epoch round-trip", mayanFromRd(rdFromMayan(0, 0, 0, 0, 0)), {
  baktun: 0, katun: 0, tun: 0, uinal: 0, kin: 0,
});

// Easter: Easter 2024 = 31 March 2024 Gregorian.
const e2024 = easterGregorian(2024);
eq("Easter 2024", { y: e2024.y, m: e2024.m, d: e2024.d }, { y: 2024, m: 3, d: 31 });
const e1996 = easterGregorian(1996);
eq("Easter 1996", { y: e1996.y, m: e1996.m, d: e1996.d }, { y: 1996, m: 4, d: 7 });

// End-to-end: run a Query.
const r = run({
  input: { calendar: "gregorian", fields: { y: 2026, m: 5, d: 3 } },
  operations: [],
});
eq("run() JD for 2026-05-03", r.jd, 2461164);
eq("run() day-of-week (Sunday=0)", r.dayOfWeek, 0);
const heb = r.dates.hebrew;
if (!heb) {
  failed++;
  console.log("FAIL run() produced no hebrew date");
} else {
  eq("run() Hebrew for 2026-05-03", heb.fields, { y: 5786, m: 2, d: 16 });
}

// Arithmetic: Jan 31 + 1 month with clamp policy → Feb 28/29.
const r2 = run({
  input: { calendar: "gregorian", fields: { y: 2025, m: 1, d: 31 } },
  operations: [{ kind: "add", amount: 1, unit: "month" }],
  rules: { monthEndPolicy: "clamp" },
});
eq("Jan 31 2025 + 1 month (clamp) → Feb 28", r2.dates.gregorian?.fields, {
  y: 2025, m: 2, d: 28,
});

// Business day: Friday + 1 business day → Monday.
const fri = run({
  input: { calendar: "gregorian", fields: { y: 2026, m: 5, d: 1 } }, // Friday
  operations: [{ kind: "add", amount: 1, unit: "business-day" }],
});
eq("Fri 2026-05-01 + 1 business day → Mon 2026-05-04", fri.dates.gregorian?.fields, {
  y: 2026, m: 5, d: 4,
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
