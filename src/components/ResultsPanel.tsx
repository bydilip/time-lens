import CalendarRow from "./CalendarRow";
import EdgeCaseBadge from "./EdgeCaseBadge";
import { CALENDARS, type CalendarDate, type CalendarId, type Result } from "../types";

type Props = {
  result: Result;
  inputCalendar: CalendarId;
  onSelectAsInput: (date: CalendarDate) => void;
};

export default function ResultsPanel({ result, inputCalendar, onSelectAsInput }: Props) {
  return (
    <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
      <header className="flex items-center justify-between mb-3">
        <h2 className="text-xs uppercase tracking-wider text-neutral-500">Results</h2>
        <span className="font-mono text-xs text-neutral-400">JD {result.jd}</span>
      </header>

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

      {result.flags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {result.flags.map((f, i) => (
            <EdgeCaseBadge key={i} flag={f} />
          ))}
        </div>
      )}
    </section>
  );
}
