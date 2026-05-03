import { register } from "../registry";
import type { CalendarAdapter } from "../types";
import { gregorian } from "./gregorian";
import { julian } from "./julian";
import { hebrew } from "./hebrew";
import { islamic } from "./islamic";
import { persian } from "./persian";
import { coptic } from "./coptic";
import { ethiopic } from "./ethiopic";
import { frenchRev } from "./french-rev";
import { mayan } from "./mayan";
import { egyptian } from "./egyptian";
import { isoWeek } from "./iso-week";
import { roman } from "./roman";
import { jdAdapter } from "./jd";

let registered = false;

export function registerCalendars(): void {
  if (registered) return;
  registered = true;
  const adapters: CalendarAdapter[] = [
    gregorian, julian, hebrew, islamic, persian,
    coptic, ethiopic, frenchRev, mayan, egyptian,
    isoWeek, roman, jdAdapter,
  ];
  adapters.forEach(register);
}
