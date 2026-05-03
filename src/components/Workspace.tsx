import QueryPanel from "./QueryPanel";
import ResultsPanel from "./ResultsPanel";
import Timeline from "./Timeline";
import ExplainTrace from "./ExplainTrace";
import ShareBar from "./ShareBar";
import type { Query, Result } from "../types";

type Props = {
  query: Query;
  setQuery: (q: Query) => void;
  result: Result;
};

export default function Workspace({ query, setQuery, result }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QueryPanel query={query} setQuery={setQuery} />
        <ResultsPanel
          result={result}
          inputCalendar={query.input.calendar}
          onSelectAsInput={(date) =>
            setQuery({ ...query, input: date })
          }
        />
      </div>
      <Timeline query={query} result={result} />
      <ExplainTrace trace={result.trace} />
      <ShareBar query={query} result={result} />
    </div>
  );
}
