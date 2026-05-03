import type { Result, CalendarDate } from "./types";

export const mockInput: CalendarDate = {
  calendar: "gregorian",
  fields: { y: 2026, m: 5, d: 3 },
};

export const mockResult: Result = {
  jd: 2461164,
  dayOfWeek: 0,
  dates: {
    gregorian: { calendar: "gregorian", fields: { y: 2026, m: 5, d: 3 } },
    julian: { calendar: "julian", fields: { y: 2026, m: 4, d: 20 } },
    hebrew: { calendar: "hebrew", fields: { y: 5786, m: 2, d: 15 } },
    islamic: { calendar: "islamic", fields: { y: 1447, m: 11, d: 15 } },
    persian: { calendar: "persian", fields: { y: 1405, m: 2, d: 13 } },
    coptic: { calendar: "coptic", fields: { y: 1742, m: 8, d: 25 } },
    ethiopic: { calendar: "ethiopic", fields: { y: 2018, m: 8, d: 25 } },
    "french-rev": { calendar: "french-rev", fields: { y: 234, m: 8, d: 14 } },
    "mayan-lc": { calendar: "mayan-lc", fields: { baktun: 13, katun: 0, tun: 13, uinal: 5, kin: 1 } },
    egyptian: { calendar: "egyptian", fields: { y: 2774, m: 12, d: 8 } },
    "iso-week": { calendar: "iso-week", fields: { y: 2026, w: 18, d: 7 } },
    roman: { calendar: "roman", fields: { text: "ante diem V Non. Mai. MMDCCLXXIX AUC" } },
    jd: { calendar: "jd", fields: { jd: 2461164 } },
  },
  flags: [
    { kind: "leap-year", calendar: "gregorian", message: "2026 is not a Gregorian leap year." },
    { kind: "hebrew-leap", calendar: "hebrew", message: "5786 is a Hebrew leap year (13 months)." },
  ],
  trace: [
    {
      id: "1",
      description: "Convert input Gregorian (2026-05-03) to Julian Date pivot.",
      from: { y: 2026, m: 5, d: 3 },
      to: 2461164,
      rule: "jd_from_greg",
    },
    {
      id: "2",
      description: "Compute weekday from JD modulo 7.",
      from: 2461164,
      to: "Sunday",
      rule: "dow_from_jd",
    },
    {
      id: "3",
      description: "Project pivot into all 12 target calendars.",
      from: 2461164,
      to: "12 calendar representations",
    },
  ],
};
