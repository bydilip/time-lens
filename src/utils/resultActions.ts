import type { CalendarDate, Result } from "../types";

export function formatCalendarDate(date: CalendarDate): string {
  const fields = date.fields;

  if (date.calendar === "mayan-lc") {
    return `${fields.baktun}.${fields.katun}.${fields.tun}.${fields.uinal}.${fields.kin}`;
  }

  if (date.calendar === "iso-week") {
    return `${fields.y}-W${String(fields.w).padStart(2, "0")}-${fields.d}`;
  }

  if (date.calendar === "jd") return String(fields.jd);
  if (date.calendar === "roman") return String(fields.text ?? "");

  if ("y" in fields && "m" in fields && "d" in fields) {
    return `${fields.y}-${String(fields.m).padStart(2, "0")}-${String(fields.d).padStart(2, "0")}`;
  }

  return JSON.stringify(fields);
}

export function copyGregorianResult(result: Result | null): void {
  const gregorian = result?.dates.gregorian;
  if (!gregorian) return;

  navigator.clipboard?.writeText(formatCalendarDate(gregorian));
}

export function exportResultCsv(result: Result | null): void {
  if (!result) return;

  const rows = [["calendar", "date"]];
  for (const [calendar, date] of Object.entries(result.dates)) {
    if (date) {
      rows.push([calendar, formatCalendarDate(date)]);
    }
  }

  const csv = rows
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "timelens-results.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeCsvCell(value: string): string {
  if (!/[",\n]/.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
}
