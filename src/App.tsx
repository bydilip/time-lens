import { useMemo, useState } from "react";
import TopBar from "./components/TopBar";
import SmartInput from "./components/SmartInput";
import Workspace from "./components/Workspace";
import type { Query, Result } from "./types";
import { mockInput } from "./mock";
import { getAdapter, run } from "./engine";
import { parseNaturalLanguageQuery } from "./utils/naturalLanguage";

type CalculationState = {
  result: Result | null;
  error: string | null;
  isLoading: boolean;
};

export default function App() {
  const [query, setQuery] = useState<Query>({ input: mockInput, operations: [] });
  const [inputError, setInputError] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const calculation: CalculationState = useMemo(() => {
    try {
      validateQuery(query);
      return { result: run(query), error: null, isLoading: false };
    } catch (error) {
      return {
        result: null,
        error: error instanceof Error ? error.message : "Unable to calculate this date.",
        isLoading: false,
      };
    }
  }, [query]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <TopBar onOpenPalette={() => setPaletteOpen(true)} />
      <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <SmartInput
          onSubmit={(text) => {
            try {
              setQuery(parseNaturalLanguageQuery(text));
              setInputError(null);
            } catch (error) {
              setInputError(
                error instanceof Error ? error.message : "Unable to parse that command.",
              );
            }
          }}
          error={inputError}
        />
        <Workspace query={query} setQuery={setQuery} calculation={calculation} />
      </main>
      {paletteOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-start justify-center pt-32"
          onClick={() => setPaletteOpen(false)}
        >
          <div
            className="w-[480px] rounded-lg bg-white dark:bg-neutral-900 shadow-xl border border-neutral-200 dark:border-neutral-800 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              placeholder="Search calendars, jump to today, share..."
              className="w-full px-3 py-2 bg-transparent outline-none text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function validateQuery(query: Query): void {
  const adapter = getAdapter(query.input.calendar);

  for (const field of adapter.schema) {
    const value = query.input.fields[field.name];
    if (value === undefined || value === "") {
      throw new Error(`Enter ${field.label.toLowerCase()} for the ${adapter.label} date.`);
    }
    if (field.kind !== "text" && !Number.isFinite(Number(value))) {
      throw new Error(`${field.label} must be a valid number.`);
    }
  }

  for (const op of query.operations) {
    if ((op.kind === "add" || op.kind === "sub") && !Number.isFinite(op.amount)) {
      throw new Error("Operation amount must be a valid number.");
    }
  }
}
