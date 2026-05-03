import type { CalendarDate, EdgeCaseFlag } from "../types";
import { gregorianFromRd, gregorianLeap } from "./calendars/gregorian";
import { julianFromRd, julianLeap } from "./calendars/julian";
import { hebrewFromRd, hebrewLeapYear } from "./calendars/hebrew";
import { islamicFromRd, islamicLeap } from "./calendars/islamic";
import { persianFromRd, persianLeap } from "./calendars/persian";
import { rdFromJd } from "./pivot";
import { get } from "./registry";

const GREGORIAN_GAP_START_JD = 2299150; // 5 Oct 1582 Julian
const GREGORIAN_GAP_END_JD = 2299160; // 14 Oct 1582 Julian (last day skipped)

export function detectFlags(jd: number, inputCalendar: CalendarDate["calendar"]): EdgeCaseFlag[] {
  const flags: EdgeCaseFlag[] = [];
  const rd = rdFromJd(jd);

  const greg = gregorianFromRd(rd);
  if (gregorianLeap(greg.y)) {
    flags.push({
      kind: "leap-year",
      calendar: "gregorian",
      message: `${greg.y} is a Gregorian leap year (366 days).`,
    });
  }

  if (inputCalendar === "julian" || jd < 2299161) {
    const j = julianFromRd(rd);
    if (julianLeap(j.y) && j.y !== greg.y) {
      flags.push({
        kind: "leap-year",
        calendar: "julian",
        message: `${j.y} is a Julian leap year.`,
      });
    }
  }

  if (jd >= GREGORIAN_GAP_START_JD && jd <= GREGORIAN_GAP_END_JD) {
    flags.push({
      kind: "gregorian-gap",
      message: `5–14 October 1582 was skipped when most countries adopted the Gregorian calendar.`,
    });
  }

  const heb = hebrewFromRd(rd);
  if (hebrewLeapYear(heb.y)) {
    flags.push({
      kind: "hebrew-leap",
      calendar: "hebrew",
      message: `Hebrew year ${heb.y} is a leap year (13 months, includes Adar II).`,
    });
  }

  const isl = islamicFromRd(rd);
  if (islamicLeap(isl.y)) {
    flags.push({
      kind: "leap-year",
      calendar: "islamic",
      message: `Islamic year ${isl.y} AH is a kabisah (leap) year.`,
    });
  }

  const per = persianFromRd(rd);
  if (persianLeap(per.y)) {
    flags.push({
      kind: "leap-year",
      calendar: "persian",
      message: `Persian year ${per.y} AP is a leap year.`,
    });
  }

  for (const id of ["gregorian", "islamic", "coptic", "mayan-lc", "roman"] as const) {
    const adapter = get(id);
    const r = adapter.validRange;
    if (r?.minJd != null && jd < r.minJd) {
      flags.push({
        kind: "pre-epoch",
        calendar: id,
        message: `${adapter.label} was not yet in use at this date (epoch JD ${r.minJd}).`,
      });
    }
  }

  return flags;
}
