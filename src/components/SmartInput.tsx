import { useState } from "react";

type Props = {
  onSubmit: (text: string) => void;
};

export default function SmartInput({ onSubmit }: Props) {
  const [value, setValue] = useState("");

  return (
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
        placeholder='Try "5 business days after my birthday" or "15 Iyar 5786 in Gregorian"'
        className="flex-1 bg-transparent outline-none text-sm placeholder:text-neutral-400"
      />
      <kbd className="font-mono text-xs text-neutral-400 border border-neutral-200 dark:border-neutral-800 rounded px-1.5 py-0.5">
        Ret
      </kbd>
    </form>
  );
}
