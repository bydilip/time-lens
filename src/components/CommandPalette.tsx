import { useEffect, useMemo, useState } from "react";

export type PaletteCommand = {
  id: string;
  label: string;
  description: string;
  disabled?: boolean;
  disabledReason?: string;
  run: () => void;
};

type Props = {
  commands: PaletteCommand[];
  onClose: () => void;
};

export default function CommandPalette({ commands, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return commands;

    return commands.filter((command) => {
      const haystack = `${command.label} ${command.description}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (filtered.length > 0) {
          setSelectedIndex((index) => Math.min(index + 1, filtered.length - 1));
        }
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((index) => Math.max(index - 1, 0));
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const command = filtered[selectedIndex];
        if (command && !command.disabled) {
          command.run();
          onClose();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filtered, onClose, selectedIndex]);

  return (
    <div
      className="fixed inset-0 z-20 flex items-start justify-center bg-black/40 px-4 pt-24"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search commands..."
          className="w-full border-b border-neutral-100 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-neutral-400 dark:border-neutral-800"
        />
        <ul className="max-h-[320px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-neutral-500">
              No commands found
            </li>
          ) : (
            filtered.map((command, index) => (
              <li key={command.id}>
                <button
                  type="button"
                  disabled={command.disabled}
                  title={command.disabled ? command.disabledReason : undefined}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => {
                    if (!command.disabled) {
                      command.run();
                      onClose();
                    }
                  }}
                  className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                    index === selectedIndex
                      ? "bg-violet-50 dark:bg-violet-950/40"
                      : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  } ${command.disabled ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <span className="block text-sm font-medium">{command.label}</span>
                  <span className="block text-xs text-neutral-500">
                    {command.disabled && command.disabledReason
                      ? command.disabledReason
                      : command.description}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
