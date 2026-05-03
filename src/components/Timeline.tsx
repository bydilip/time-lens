import type { Query, Result } from "../types";

type Props = {
  query: Query;
  result: Result | null;
};

// Placeholder timeline. Phase 2 wires intermediate dates from the engine
// for each operation step; here we just render the input -> final hop.
export default function Timeline({ query, result }: Props) {
  const steps = [
    { label: "Input", value: formatBrief(query.input.fields) },
    ...query.operations.map((op) => ({
      label: pillLabel(op),
      value: "...",
    })),
    { label: "Result", value: result ? `JD ${result.jd}` : "Invalid input" },
  ];

  return (
    <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-wider text-neutral-500">Timeline</h2>
      </header>
      <ol className="relative flex items-start gap-6 overflow-x-auto pb-2">
        <div className="absolute top-2 left-2 right-2 h-px bg-neutral-200 dark:bg-neutral-800" />
        {steps.map((s, i) => (
          <li key={i} className="relative flex flex-col items-start gap-1 min-w-[120px]">
            <span className="relative z-10 w-4 h-4 rounded-full border-2 border-violet-500 bg-white dark:bg-neutral-900" />
            <span className="text-xs uppercase tracking-wide text-neutral-500">{s.label}</span>
            <span className="font-mono text-sm tabular-nums">{s.value}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function formatBrief(f: Record<string, number | string>): string {
  if ("y" in f && "m" in f && "d" in f) {
    return `${f.y}-${String(f.m).padStart(2, "0")}-${String(f.d).padStart(2, "0")}`;
  }
  return JSON.stringify(f);
}

function pillLabel(op: import("../types").Operation): string {
  switch (op.kind) {
    case "add":
    case "sub":
      return `${op.kind === "add" ? "+" : "-"}${op.amount} ${op.unit}`;
    case "skip":
      return `skip ${op.what}`;
    case "next":
      return `next ${op.target}`;
    case "prev":
      return `prev ${op.target}`;
    case "diff":
      return "diff";
    case "convert":
      return `→ ${op.to}`;
  }
}
