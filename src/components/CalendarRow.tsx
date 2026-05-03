import type { CalendarDate, CalendarMeta } from "../types";

type Props = {
  meta: CalendarMeta;
  date: CalendarDate;
  highlighted?: boolean;
  onClick?: () => void;
};

// Display formatter — Phase 1 will replace this with each adapter's `format()`.
function formatFields(date: CalendarDate): string {
  const f = date.fields;
  if (date.calendar === "mayan-lc") {
    return `${f.baktun}.${f.katun}.${f.tun}.${f.uinal}.${f.kin}`;
  }
  if (date.calendar === "iso-week") return `${f.y}-W${String(f.w).padStart(2, "0")}-${f.d}`;
  if (date.calendar === "jd") return String(f.jd);
  if (date.calendar === "roman") return String(f.text ?? "");
  if ("y" in f && "m" in f && "d" in f) return `${f.y}-${String(f.m).padStart(2, "0")}-${String(f.d).padStart(2, "0")}`;
  return JSON.stringify(f);
}

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
      <span className="font-mono text-sm tabular-nums">{formatFields(date)}</span>
    </button>
  );
}
