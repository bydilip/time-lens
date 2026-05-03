import { CALENDARS, type CalendarId } from "../types";

type Props = {
  value: CalendarId;
  onChange: (id: CalendarId) => void;
};

export default function CalendarPicker({ value, onChange }: Props) {
  return (
    <label className="block">
      <span className="text-xs text-neutral-500">Calendar</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as CalendarId)}
        className="mt-1 w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
      >
        {CALENDARS.map((c) => (
          <option key={c.id} value={c.id} className="bg-white dark:bg-neutral-900">
            {c.label}
          </option>
        ))}
      </select>
    </label>
  );
}
