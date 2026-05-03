import CalendarPicker from "./CalendarPicker";
import DateField from "./DateField";
import OperationList from "./OperationList";
import type { Query } from "../types";

type Props = {
  query: Query;
  setQuery: (q: Query) => void;
};

export default function QueryPanel({ query, setQuery }: Props) {
  return (
    <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-wider text-neutral-500">Input</h2>
      </header>

      <div className="space-y-3">
        <CalendarPicker
          value={query.input.calendar}
          onChange={(calendar) =>
            setQuery({ ...query, input: { calendar, fields: {} } })
          }
        />
        <DateField
          calendar={query.input.calendar}
          value={query.input.fields}
          onChange={(fields) =>
            setQuery({ ...query, input: { ...query.input, fields } })
          }
        />
      </div>

      <OperationList
        operations={query.operations}
        setOperations={(operations) => setQuery({ ...query, operations })}
      />
    </section>
  );
}
