import type { EdgeCaseFlag } from "../types";

const COLORS: Record<EdgeCaseFlag["kind"], string> = {
  "leap-year": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
  "month-end-clamp": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  "gregorian-gap": "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900",
  "pre-epoch": "bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700",
  "hebrew-leap": "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900",
};

const LABELS: Record<EdgeCaseFlag["kind"], string> = {
  "leap-year": "Leap year",
  "month-end-clamp": "Month-end clamp",
  "gregorian-gap": "Gregorian gap",
  "pre-epoch": "Pre-epoch",
  "hebrew-leap": "Hebrew leap year",
};

export default function EdgeCaseBadge({ flag }: { flag: EdgeCaseFlag }) {
  return (
    <span
      title={flag.message}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs ${COLORS[flag.kind]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {LABELS[flag.kind]}
    </span>
  );
}
