import { useState } from "react";

type Props = {
  onSubmit: (text: string) => void;
  error?: string | null;
};

export default function SmartInput({ onSubmit, error }: Props) {
  const [value, setValue] = useState("");

  return (
    <div className="space-y-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) onSubmit(value.trim());
        }}
        className="flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-violet-500/40"
      >
        <span className="text-neutral-400">›</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder='Try "add 5 days to Jan 10 2026" or "10 days after 2026-01-10"'
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-neutral-400"
        />
        <kbd className="font-mono text-xs text-neutral-400 border border-neutral-200 dark:border-neutral-800 rounded px-1.5 py-0.5">
          Ret
        </kbd>
      </form>
      {error && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-200">
          {error}
        </p>
      )}
    </div>
  );
}
