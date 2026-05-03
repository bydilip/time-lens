// Minimal type stubs for Step 3 UI scaffolding.
// Final shapes live in src/engine/ once Phase 1 ports the calendrical math.

export type CalendarId =
  | "gregorian"
  | "julian"
  | "hebrew"
  | "islamic"
  | "persian"
  | "coptic"
  | "ethiopic"
  | "french-rev"
  | "mayan-lc"
  | "egyptian"
  | "iso-week"
  | "roman"
  | "jd";

export type CalendarDate = {
  calendar: CalendarId;
  fields: Record<string, number | string>;
};

export type Operation =
  | { kind: "add" | "sub"; amount: number; unit: "day" | "week" | "month" | "year" | "business-day" }
  | { kind: "skip"; what: "weekend" | "holiday" }
  | { kind: "next" | "prev"; target: string }
  | { kind: "diff"; other: CalendarDate; in: "day" | "week" | "month" | "business-day" }
  | { kind: "convert"; to: CalendarId };

export type RuleSet = {
  weekStart?: "mon" | "sun";
  weekend?: ("mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")[];
  holidayCalendar?: "us" | "uk" | "in" | "il" | "sa" | "none";
  monthEndPolicy?: "clamp" | "overflow";
};

export type Query = {
  input: CalendarDate;
  operations: Operation[];
  outputCalendars?: CalendarId[];
  rules?: RuleSet;
};

export type EdgeCaseFlag = {
  kind: "leap-year" | "month-end-clamp" | "gregorian-gap" | "pre-epoch" | "hebrew-leap";
  calendar?: CalendarId;
  message: string;
};

export type TraceStep = {
  id: string;
  description: string;
  from?: unknown;
  to?: unknown;
  rule?: string;
};

export type Result = {
  dates: Partial<Record<CalendarId, CalendarDate>>;
  jd: number;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  flags: EdgeCaseFlag[];
  trace: TraceStep[];
};

export type CalendarMeta = {
  id: CalendarId;
  label: string;
  short: string;
};

export const CALENDARS: CalendarMeta[] = [
  { id: "gregorian", label: "Gregorian", short: "Greg" },
  { id: "julian", label: "Julian", short: "Jul" },
  { id: "hebrew", label: "Hebrew", short: "Heb" },
  { id: "islamic", label: "Islamic", short: "Isl" },
  { id: "persian", label: "Persian", short: "Per" },
  { id: "coptic", label: "Coptic", short: "Copt" },
  { id: "ethiopic", label: "Ethiopic", short: "Eth" },
  { id: "french-rev", label: "French Revolutionary", short: "FR" },
  { id: "mayan-lc", label: "Mayan Long Count", short: "May" },
  { id: "egyptian", label: "Ancient Egyptian", short: "Egy" },
  { id: "iso-week", label: "ISO Week", short: "ISO" },
  { id: "roman", label: "Roman", short: "Rom" },
  { id: "jd", label: "Julian Date", short: "JD" },
];
