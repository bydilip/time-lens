import { useState } from "react";
import TopBar from "./components/TopBar";
import SmartInput from "./components/SmartInput";
import Workspace from "./components/Workspace";
import type { Query } from "./types";
import { mockInput, mockResult } from "./mock";

export default function App() {
  const [query, setQuery] = useState<Query>({ input: mockInput, operations: [] });
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <TopBar onOpenPalette={() => setPaletteOpen(true)} />
      <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <SmartInput
          onSubmit={(text) => {
            // NL parsing lands in Phase 3; for now just echo.
            console.log("NL input:", text);
          }}
        />
        <Workspace query={query} setQuery={setQuery} result={mockResult} />
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
