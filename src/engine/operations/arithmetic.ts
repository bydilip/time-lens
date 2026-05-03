import type { CalendarDate, RuleSet } from "../../types";
import { get } from "../registry";
import type { TraceCollector } from "../trace";
import { gregorian, gregorianFromRd, gregorianLeap, rdFromGregorian } from "../calendars/gregorian";
import { rdFromJd, jdFromRd } from "../pivot";

type AddSubOp = {
  kind: "add" | "sub";
  amount: number;
  unit: "day" | "week" | "month" | "year" | "business-day";
};

function lastDayOfGregorianMonth(y: number, m: number): number {
  if (m === 2) return gregorianLeap(y) ? 29 : 28;
  return [4, 6, 9, 11].includes(m) ? 30 : 31;
}

export function applyAddSub(
  jd: number,
  op: AddSubOp,
  rules: RuleSet,
  trace?: TraceCollector,
): { jd: number; clamped?: boolean } {
  const sign = op.kind === "sub" ? -1 : 1;
  const amount = sign * op.amount;

  if (op.unit === "day") {
    return { jd: jd + amount };
  }
  if (op.unit === "week") {
    return { jd: jd + amount * 7 };
  }
  if (op.unit === "business-day") {
    return advanceBusinessDays(jd, amount, rules, trace);
  }

  // month / year — work in Gregorian fields, applying the month-end policy.
  const rd = rdFromJd(jd);
  const g = gregorianFromRd(rd);
  let y = g.y;
  let m = g.m;
  let d = g.d;

  if (op.unit === "year") y += amount;
  else {
    const totalMonths = (y * 12 + (m - 1)) + amount;
    y = Math.floor(totalMonths / 12);
    m = (totalMonths % 12) + 1;
  }

  const last = lastDayOfGregorianMonth(y, m);
  let clamped = false;
  if (d > last) {
    if (rules.monthEndPolicy === "overflow") {
      const overflow = d - last;
      const newRd = rdFromGregorian(y, m, last) + overflow;
      trace?.push({
        description: `${op.kind} ${op.amount} ${op.unit} → overflow ${overflow}d past ${y}-${m}-${last}`,
        rule: "month-end-overflow",
      });
      return { jd: jdFromRd(newRd) };
    }
    d = last;
    clamped = true;
    trace?.push({
      description: `${op.kind} ${op.amount} ${op.unit} → clamped day ${g.d} → ${d} for ${y}-${m}`,
      rule: "month-end-clamp",
    });
  }
  return { jd: jdFromRd(rdFromGregorian(y, m, d)), clamped };
}

export function advanceBusinessDays(
  jd: number,
  amount: number,
  rules: RuleSet,
  trace?: TraceCollector,
): { jd: number } {
  const weekend = new Set(rules.weekend ?? ["sat", "sun"]);
  const step = amount > 0 ? 1 : -1;
  let remaining = Math.abs(amount);
  let cur = jd;
  while (remaining > 0) {
    cur += step;
    if (!isWeekend(cur, weekend)) remaining--;
  }
  trace?.push({
    description: `${amount} business days from JD ${jd} → JD ${cur}`,
    rule: "business-day-advance",
  });
  return { jd: cur };
}

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export function isWeekend(jd: number, weekend: Set<string>): boolean {
  const dow = ((jd + 1) % 7 + 7) % 7; // 0=Sun..6=Sat
  return weekend.has(DAY_KEYS[dow]);
}

export function dateToJd(date: CalendarDate): number {
  return get(date.calendar).toJd(date.fields as never);
}

export function jdToDate(jd: number, calendarId: CalendarDate["calendar"]): CalendarDate {
  const fields = get(calendarId).fromJd(jd);
  return { calendar: calendarId, fields: fields as Record<string, number | string> };
}

// Re-export to keep the public surface tidy.
export { gregorian };
