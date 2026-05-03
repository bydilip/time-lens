import type { CalendarDate, Result } from "../types";

type Props = {
  result: Result | null;
  error: string | null;
  inputDate: CalendarDate;
};

type EdgeCaseNote = {
  id: string;
  label: string;
  detail: string;
  tone: "warning" | "note";
};

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function EdgeCasePanel({ result, error, inputDate }: Props) {
  const notes = buildNotes(result, error, inputDate);

  if (notes.length === 0) return null;

  return (
    <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900/60">
      <h3 className="text-xs uppercase tracking-wider text-neutral-500">
        Edge cases
      </h3>
      <ul className="mt-3 space-y-2">
        {notes.map((note) => (
          <li key={note.id} className="flex gap-2">
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                note.tone === "warning"
                  ? "bg-amber-500"
                  : "bg-violet-500"
              }`}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                {note.label}
              </p>
              <p className="text-xs leading-5 text-neutral-500">
                {note.detail}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function buildNotes(
  result: Result | null,
  error: string | null,
  inputDate: CalendarDate,
): EdgeCaseNote[] {
  const notes = new Map<string, EdgeCaseNote>();

  if (error) {
    notes.set("invalid-input", {
      id: "invalid-input",
      label: "Invalid date input",
      detail: error,
      tone: "warning",
    });
  }

  if (!result) {
    return Array.from(notes.values());
  }

  for (const flag of result.flags) {
    if (flag.kind === "leap-year" || flag.kind === "hebrew-leap") {
      notes.set(`${flag.kind}-${flag.calendar ?? "date"}`, {
        id: `${flag.kind}-${flag.calendar ?? "date"}`,
        label: "Leap year detected",
        detail: flag.message,
        tone: "note",
      });
    }

    if (flag.kind === "gregorian-gap") {
      notes.set("gregorian-gap", {
        id: "gregorian-gap",
        label: "Gregorian calendar gap",
        detail: flag.message,
        tone: "warning",
      });
    }

    if (flag.kind === "pre-epoch") {
      notes.set(`pre-epoch-${flag.calendar ?? "date"}`, {
        id: `pre-epoch-${flag.calendar ?? "date"}`,
        label: "Before calendar epoch",
        detail: flag.message,
        tone: "warning",
      });
    }

    if (flag.kind === "month-end-clamp") {
      notes.set("month-end-adjustment", {
        id: "month-end-adjustment",
        label: "Month-end adjustment applied",
        detail: flag.message,
        tone: "warning",
      });
    }
  }

  const monthEndStep = result.trace.find((step) =>
    step.rule === "month-end-clamp" || step.rule === "month-end-overflow"
  );
  if (monthEndStep) {
    notes.set("month-end-adjustment", {
      id: "month-end-adjustment",
      label: "Month-end adjustment applied",
      detail: monthEndStep.description,
      tone: "warning",
    });
  }

  const finalGregorian = result.dates.gregorian?.fields;
  const inputYear = getInputYear(inputDate);
  const finalGregorianYear = getNumericField(finalGregorian, "y");
  if (
    inputYear !== null &&
    finalGregorianYear !== null &&
    inputYear !== finalGregorianYear
  ) {
    notes.set("crossed-calendar-year", {
      id: "crossed-calendar-year",
      label: "Crossed calendar year",
      detail: `Calculation moved from ${inputYear} to ${finalGregorianYear}.`,
      tone: "note",
    });
  }

  if (result.dayOfWeek === 0 || result.dayOfWeek === 6) {
    notes.set("weekend-result", {
      id: "weekend-result",
      label: "Result lands on weekend",
      detail: `Final date is a ${WEEKDAYS[result.dayOfWeek]}.`,
      tone: "warning",
    });
  }

  const isoWeek = result.dates["iso-week"]?.fields;
  const isoYear = getNumericField(isoWeek, "y");
  const gregorianMonth = getNumericField(finalGregorian, "m");
  const isoWeekNumber = getNumericField(isoWeek, "w");
  if (
    isoYear !== null &&
    finalGregorianYear !== null &&
    (isoYear !== finalGregorianYear ||
      (gregorianMonth === 12 && isoWeekNumber === 1) ||
      (gregorianMonth === 1 && isoWeekNumber !== null && isoWeekNumber >= 52))
  ) {
    notes.set("iso-week-boundary", {
      id: "iso-week-boundary",
      label: "ISO week/year boundary",
      detail: `Gregorian year ${finalGregorianYear} maps to ISO week-year ${isoYear}.`,
      tone: "note",
    });
  }

  return Array.from(notes.values());
}

function getInputYear(inputDate: CalendarDate): number | null {
  if (inputDate.calendar === "gregorian") {
    return getNumericField(inputDate.fields, "y");
  }

  return null;
}

function getNumericField(
  fields: Record<string, number | string> | undefined,
  key: string,
): number | null {
  const value = fields?.[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }
  return null;
}
