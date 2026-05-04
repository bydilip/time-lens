import type { CalendarDate, CalendarMeta } from "../types";
import { formatCalendarDate } from "../utils/resultActions";

type Props = {
  meta: CalendarMeta;
  date: CalendarDate;
  highlighted?: boolean;
  onClick?: () => void;
};

export default function CalendarRow({ meta, date, highlighted, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center justify-between gap-4 py-2.5 px-2 rounded-md transition-colors ${
        highlighted
          ? "bg-violet-50 dark:bg-violet-950/40"
          : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`text-xs font-mono w-12 ${
            highlighted ? "text-violet-700 dark:text-violet-300" : "text-neutral-400"
          }`}
        >
          {meta.short}
        </span>
        <span className="text-sm">{meta.label}</span>
      </div>
      <span className="font-mono text-sm tabular-nums">{formatCalendarDate(date)}</span>
    </button>
  );
}
