import type { CalendarId } from "../types";
import type { TraceCollector } from "./trace";

export type FieldSchema = Array<{
  name: string;
  label: string;
  kind: "year" | "month" | "day" | "int" | "text";
}>;

export interface CalendarAdapter<F extends Record<string, number | string> = Record<string, number | string>> {
  id: CalendarId;
  label: string;
  schema: FieldSchema;
  toJd(fields: F, trace?: TraceCollector): number;
  fromJd(jd: number, trace?: TraceCollector): F;
  format(fields: F): string;
  validRange?: { minJd?: number; maxJd?: number };
  monthNames?: string[];
}
