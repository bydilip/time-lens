import type { CalendarAdapter } from "../types";

type JdFields = { jd: number };

export const jdAdapter: CalendarAdapter<JdFields> = {
  id: "jd",
  label: "Julian Date",
  schema: [{ name: "jd", label: "Julian Date", kind: "int" }],
  toJd: ({ jd }) => jd,
  fromJd: (jd) => ({ jd }),
  format: ({ jd }) => String(jd),
};
