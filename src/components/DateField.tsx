import type { CalendarId } from "../types";

type Props = {
  calendar: CalendarId;
  value: Record<string, number | string>;
  onChange: (fields: Record<string, number | string>) => void;
};

// Field schemas per calendar. In Phase 1 these come from each adapter's
// `schema` property; here they are inlined for the UI skeleton.
const SCHEMAS: Record<CalendarId, Array<{ name: string; label: string; width?: string }>> = {
  gregorian: [
    { name: "y", label: "Year" },
    { name: "m", label: "Month", width: "w-20" },
    { name: "d", label: "Day", width: "w-16" },
  ],
  julian: [
    { name: "y", label: "Year" },
    { name: "m", label: "Month", width: "w-20" },
    { name: "d", label: "Day", width: "w-16" },
  ],
  hebrew: [
    { name: "y", label: "Year" },
    { name: "m", label: "Month", width: "w-20" },
    { name: "d", label: "Day", width: "w-16" },
  ],
  islamic: [
    { name: "y", label: "Year" },
    { name: "m", label: "Month", width: "w-20" },
    { name: "d", label: "Day", width: "w-16" },
  ],
  persian: [
    { name: "y", label: "Year" },
    { name: "m", label: "Month", width: "w-20" },
    { name: "d", label: "Day", width: "w-16" },
  ],
  coptic: [
    { name: "y", label: "Year" },
    { name: "m", label: "Month", width: "w-20" },
    { name: "d", label: "Day", width: "w-16" },
  ],
  ethiopic: [
    { name: "y", label: "Year" },
    { name: "m", label: "Month", width: "w-20" },
    { name: "d", label: "Day", width: "w-16" },
  ],
  "french-rev": [
    { name: "y", label: "Year" },
    { name: "m", label: "Month", width: "w-20" },
    { name: "d", label: "Day", width: "w-16" },
  ],
  "mayan-lc": [
    { name: "baktun", label: "Baktun", width: "w-16" },
    { name: "katun", label: "Katun", width: "w-16" },
    { name: "tun", label: "Tun", width: "w-16" },
    { name: "uinal", label: "Uinal", width: "w-16" },
    { name: "kin", label: "Kin", width: "w-16" },
  ],
  egyptian: [
    { name: "y", label: "Year" },
    { name: "m", label: "Month", width: "w-20" },
    { name: "d", label: "Day", width: "w-16" },
  ],
  "iso-week": [
    { name: "y", label: "Year" },
    { name: "w", label: "Week", width: "w-16" },
    { name: "d", label: "Day", width: "w-16" },
  ],
  roman: [{ name: "text", label: "Roman date" }],
  jd: [{ name: "jd", label: "Julian Date" }],
};

export default function DateField({ calendar, value, onChange }: Props) {
  const fields = SCHEMAS[calendar];

  return (
    <div>
      <span className="text-xs text-neutral-500">Date</span>
      <div className="mt-1 flex gap-2">
        {fields.map((f) => (
          <label key={f.name} className={`flex-1 ${f.width ?? ""}`}>
            <input
              type={f.name === "text" ? "text" : "number"}
              placeholder={f.label}
              value={value[f.name] ?? ""}
              onChange={(e) => {
                const nextValue =
                  f.name === "text" || e.target.value === ""
                    ? e.target.value
                    : Number(e.target.value);
                onChange({
                  ...value,
                  [f.name]: nextValue,
                });
              }}
              className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
