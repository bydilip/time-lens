import type { CalendarDate, TraceStep } from "../types";

type Props = {
  steps: TraceStep[];
};

export default function TimelineView({ steps }: Props) {
  if (steps.length === 0) return null;

  return (
    <div className="mt-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
      <h3 className="mb-3 text-xs uppercase tracking-wider text-neutral-500">
        Timeline
      </h3>
      <ol className="space-y-0">
        {steps.map((step, index) => {
          const intermediate = formatIntermediate(step.to);

          return (
            <li key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
              {index < steps.length - 1 && (
                <span className="absolute left-[5px] top-3 h-full w-px bg-neutral-200 dark:bg-neutral-800" />
              )}
              <span className="relative mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-violet-500 bg-white dark:bg-neutral-900" />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-5 text-neutral-800 dark:text-neutral-100">
                  {step.description}
                </p>
                {intermediate && (
                  <p className="mt-1 font-mono text-xs text-neutral-500">
                    {intermediate}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function formatIntermediate(value: unknown): string | null {
  if (value === undefined || value === null) return null;

  if (isCalendarDate(value)) {
    return formatCalendarDate(value);
  }

  if (typeof value === "number" || typeof value === "string") {
    return String(value);
  }

  if (isFieldObject(value)) {
    return formatFields(value);
  }

  return null;
}

function isCalendarDate(value: unknown): value is CalendarDate {
  return (
    typeof value === "object" &&
    value !== null &&
    "calendar" in value &&
    "fields" in value &&
    typeof (value as CalendarDate).calendar === "string" &&
    typeof (value as CalendarDate).fields === "object" &&
    (value as CalendarDate).fields !== null
  );
}

function isFieldObject(value: unknown): value is Record<string, number | string> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every(
    (item) => typeof item === "number" || typeof item === "string",
  );
}

function formatCalendarDate(date: CalendarDate): string {
  return `${date.calendar}: ${formatFields(date.fields)}`;
}

function formatFields(fields: Record<string, number | string>): string {
  if ("y" in fields && "m" in fields && "d" in fields) {
    return `${fields.y}-${pad(fields.m)}-${pad(fields.d)}`;
  }

  if ("w" in fields && "d" in fields) {
    return `${fields.y}-W${pad(fields.w)}-${fields.d}`;
  }

  if ("jd" in fields) {
    return `JD ${fields.jd}`;
  }

  if ("text" in fields) {
    return String(fields.text);
  }

  return Object.entries(fields)
    .map(([key, value]) => `${key}:${value}`)
    .join(" ");
}

function pad(value: number | string): string {
  return String(value).padStart(2, "0");
}
