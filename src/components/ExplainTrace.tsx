import { useState } from "react";
import type { TraceStep } from "../types";

export default function ExplainTrace({ trace }: { trace: TraceStep[] }) {
  const [open, setOpen] = useState(true);

  return (
    <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <h2 className="text-xs uppercase tracking-wider text-neutral-500">
          How this was calculated  ({trace.length} steps)
        </h2>
        <span className="text-neutral-400 font-mono text-xs">{open ? "v" : ">"}</span>
      </button>
      {open && (
        <ol className="mt-4 space-y-3">
          {trace.map((s, i) => (
            <li key={s.id} className="flex gap-3">
              <span className="font-mono text-xs text-neutral-400 w-5 shrink-0 pt-0.5">
                {i + 1}.
              </span>
              <div className="flex-1 space-y-1">
                <p className="text-sm">{s.description}</p>
                {s.rule && (
                  <p className="font-mono text-xs text-neutral-500">rule: {s.rule}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
