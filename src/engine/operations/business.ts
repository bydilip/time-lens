import type { RuleSet } from "../../types";
import type { TraceCollector } from "../trace";
import { isWeekend } from "./arithmetic";

export function skipWeekend(jd: number, rules: RuleSet, trace?: TraceCollector): number {
  const weekend = new Set(rules.weekend ?? ["sat", "sun"]);
  let cur = jd;
  while (isWeekend(cur, weekend)) cur++;
  if (cur !== jd) {
    trace?.push({
      description: `JD ${jd} is a weekend → skipped to JD ${cur}`,
      rule: "skip-weekend",
    });
  }
  return cur;
}

export function nextWeekday(jd: number, target: number, trace?: TraceCollector): number {
  // target: 0=Sun..6=Sat. Returns the first JD strictly after `jd` whose dow == target.
  const cur = ((jd + 1) % 7 + 7) % 7;
  const delta = ((target - cur - 1 + 7) % 7) + 1;
  const out = jd + delta;
  trace?.push({
    description: `next dow ${target}: JD ${jd} → JD ${out}`,
    rule: "next-weekday",
  });
  return out;
}

export function prevWeekday(jd: number, target: number, trace?: TraceCollector): number {
  const cur = ((jd + 1) % 7 + 7) % 7;
  const delta = ((cur - target - 1 + 7) % 7) + 1;
  const out = jd - delta;
  trace?.push({
    description: `prev dow ${target}: JD ${jd} → JD ${out}`,
    rule: "prev-weekday",
  });
  return out;
}
