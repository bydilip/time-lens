import CalendarRow from "./CalendarRow";
import EdgeCaseBadge from "./EdgeCaseBadge";
import TimelineView from "./TimelineView";
import { CALENDARS, type CalendarDate, type CalendarId, type Result } from "../types";

type Props = {
  result: Result | null;
  error: string | null;
  isLoading: boolean;
  inputCalendar: CalendarId;
  onSelectAsInput: (date: CalendarDate) => void;
};

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ResultsPanel({ result, error, isLoading, inputCalendar, onSelectAsInput }: Props) {
  const isoWeek = result?.dates["iso-week"]?.fields;

  return (
    <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
      <header className="flex items-center justify-between mb-3">
        <h2 className="text-xs uppercase tracking-wider text-neutral-500">Results</h2>
        {result && <span className="font-mono text-xs text-neutral-400">JD {result.jd}</span>}
      </header>

      {isLoading && (
        <p className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm text-neutral-500">
          Calculating...
        </p>
      )}

      {error && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-200">
          {error}
        </p>
      )}

      {result && (
        <div className="mb-3 grid grid-cols-1 gap-2 rounded-md bg-neutral-50 px-3 py-2 text-sm dark:bg-neutral-800/60 sm:grid-cols-2">
          <span>
            <span className="text-neutral-500">Day</span>{" "}
            <span className="font-medium">{WEEKDAYS[result.dayOfWeek]}</span>
          </span>
          {isoWeek && (
            <span>
              <span className="text-neutral-500">ISO week</span>{" "}
              <span className="font-mono">
                {isoWeek.y}-W{String(isoWeek.w).padStart(2, "0")}-{isoWeek.d}
              </span>
            </span>
          )}
        </div>
      )}

      {result && (
      <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {CALENDARS.map((c) => {
          const date = result.dates[c.id];
          if (!date) return null;
          return (
            <li key={c.id}>
              <CalendarRow
                meta={c}
                date={date}
                highlighted={c.id === inputCalendar}
                onClick={() => onSelectAsInput(date)}
              />
            </li>
          );
        })}
      </ul>
      )}

      {result && result.flags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {result.flags.map((f, i) => (
            <EdgeCaseBadge key={i} flag={f} />
          ))}
        </div>
      )}

      {result && <TimelineView steps={result.trace} />}
    </section>
  );
}
