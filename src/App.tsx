import { useEffect, useMemo, useState } from "react";
import CommandPalette, { type PaletteCommand } from "./components/CommandPalette";
import TopBar from "./components/TopBar";
import SmartInput from "./components/SmartInput";
import Workspace from "./components/Workspace";
import type { Query, Result } from "./types";
import { mockInput } from "./mock";
import { getAdapter, run } from "./engine";
import { parseNaturalLanguageQuery } from "./utils/naturalLanguage";
import { copyGregorianResult, exportResultCsv } from "./utils/resultActions";

type CalculationState = {
  result: Result | null;
  error: string | null;
  isLoading: boolean;
};

export default function App() {
  const [query, setQuery] = useState<Query>({ input: mockInput, operations: [] });
  const [inputError, setInputError] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const todayQuery = (): Query => ({
    input: todayGregorianDate(),
    operations: [],
  });

  const commands: PaletteCommand[] = [
    {
      id: "jump-today",
      label: "Jump to today",
      description: "Set the input date to today and keep current operations.",
      run: () => {
        setQuery({ ...query, input: todayGregorianDate() });
        setInputError(null);
      },
    },
    {
      id: "reset-calculation",
      label: "Reset calculation",
      description: "Clear operations and reset the input date to today.",
      run: () => {
        setQuery(todayQuery());
        setInputError(null);
      },
    },
    {
      id: "copy-result",
      label: "Copy result",
      description: "Copy the primary Gregorian result to the clipboard.",
      disabled: !calculation.result?.dates.gregorian,
      disabledReason: "No Gregorian result is available to copy.",
      run: () => copyGregorianResult(calculation.result),
    },
    {
      id: "export-csv",
      label: "Export CSV",
      description: "Download the current results as a CSV file.",
      disabled: !calculation.result,
      disabledReason: "No result is available to export.",
      run: () => exportResultCsv(calculation.result),
    },
    {
      id: "toggle-theme",
      label: "Toggle theme",
      description: `Switch to ${theme === "dark" ? "light" : "dark"} theme.`,
      run: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <TopBar
        onOpenPalette={() => setPaletteOpen(true)}
        onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      />
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
        <CommandPalette
          commands={commands}
          onClose={() => setPaletteOpen(false)}
        />
      )}
    </div>
  );
}

function todayGregorianDate(): Query["input"] {
  const today = new Date();
  return {
    calendar: "gregorian",
    fields: {
      y: today.getFullYear(),
      m: today.getMonth() + 1,
      d: today.getDate(),
    },
  };
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
