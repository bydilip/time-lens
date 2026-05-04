import type { Query, Result } from "../types";
import { exportResultCsv } from "../utils/resultActions";

type Props = {
  query: Query;
  result: Result;
};

// Permalink + CSV export land in Phase 4. This is the surface for them.
export default function ShareBar({ query, result }: Props) {
  const copyPermalink = () => {
    const hash = btoa(JSON.stringify(query));
    const url = `${location.origin}${location.pathname}#${hash}`;
    navigator.clipboard?.writeText(url);
  };

  const copyAsText = () => {
    const lines = Object.entries(result.dates).map(
      ([id, d]) => `${id}: ${JSON.stringify(d?.fields)}`
    );
    navigator.clipboard?.writeText(lines.join("\n"));
  };

  return (
    <footer className="flex items-center justify-end gap-2 text-sm text-neutral-500">
      <button
        onClick={copyPermalink}
        className="px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900"
      >
        Copy permalink
      </button>
      <button
        onClick={copyAsText}
        className="px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900"
      >
        Copy as text
      </button>
      <button
        onClick={() => exportResultCsv(result)}
        className="px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900"
      >
        Export CSV
      </button>
    </footer>
  );
}
