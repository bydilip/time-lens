import type { CalendarDate, CalendarId, Operation, Query, Result } from "../types";
import { CALENDARS } from "../types";
import { dayOfWeekFromJd } from "./pivot";
import { TraceCollector } from "./trace";
import { registerCalendars } from "./calendars";
import { all as allAdapters, get as getAdapter } from "./registry";
import { applyAddSub, dateToJd, jdToDate } from "./operations/arithmetic";
import { skipWeekend, nextWeekday, prevWeekday } from "./operations/business";
import { detectFlags } from "./edgecases";

registerCalendars();

const WEEKDAY_INDEX: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

export function run(query: Query): Result {
  const trace = new TraceCollector();
  const rules = query.rules ?? {};

  let jd = dateToJd(query.input);
  trace.push({
    description: `Input ${query.input.calendar} → JD ${jd}`,
    from: query.input,
    to: jd,
    rule: "to-jd",
  });

  for (const op of query.operations) {
    jd = applyOperation(jd, op, rules, trace);
  }

  const outputs = (query.outputCalendars ?? CALENDARS.map((c) => c.id)) as CalendarId[];
  const dates: Partial<Record<CalendarId, CalendarDate>> = {};
  for (const id of outputs) {
    try {
      dates[id] = jdToDate(jd, id);
    } catch {
      // Roman is output-only and may throw; ignore unconvertible.
    }
  }

  const flags = detectFlags(jd, query.input.calendar);
  trace.push({
    description: `Projected JD ${jd} into ${Object.keys(dates).length} calendars.`,
    rule: "fan-out",
  });

  return {
    jd,
    dates,
    dayOfWeek: dayOfWeekFromJd(jd),
    flags,
    trace: trace.collect(),
  };
}

function applyOperation(
  jd: number,
  op: Operation,
  rules: Query["rules"] = {},
  trace?: TraceCollector,
): number {
  switch (op.kind) {
    case "add":
    case "sub":
      return applyAddSub(jd, op, rules ?? {}, trace).jd;
    case "skip":
      if (op.what === "weekend") return skipWeekend(jd, rules ?? {}, trace);
      // skip holiday: not yet implemented; pass through.
      return jd;
    case "next": {
      const m = /^weekday:(.+)$/.exec(op.target);
      if (m) return nextWeekday(jd, WEEKDAY_INDEX[m[1].toLowerCase()] ?? 1, trace);
      return jd;
    }
    case "prev": {
      const m = /^weekday:(.+)$/.exec(op.target);
      if (m) return prevWeekday(jd, WEEKDAY_INDEX[m[1].toLowerCase()] ?? 1, trace);
      return jd;
    }
    case "diff": {
      const other = dateToJd(op.other);
      const d = jd - other;
      trace?.push({
        description: `diff: JD ${jd} − JD ${other} = ${d} days`,
        rule: "diff",
      });
      return jd;
    }
    case "convert": {
      // Pure projection — no JD change; output rendered via dates map.
      return jd;
    }
  }
}

export { allAdapters, getAdapter };
