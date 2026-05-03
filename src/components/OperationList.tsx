import OperationPill from "./OperationPill";
import type { Operation } from "../types";

type Props = {
  operations: Operation[];
  setOperations: (ops: Operation[]) => void;
};

export default function OperationList({ operations, setOperations }: Props) {
  const add = () =>
    setOperations([...operations, { kind: "add", amount: 1, unit: "day" }]);

  return (
    <div className="space-y-2">
      <header className="flex items-center justify-between">
        <span className="text-xs text-neutral-500">Operations</span>
        <button
          onClick={add}
          className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
        >
          + add operation
        </button>
      </header>
      {operations.length === 0 ? (
        <p className="text-xs text-neutral-400 italic">
          No operations. Conversion runs immediately on the input date.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {operations.map((op, i) => (
            <li key={i}>
              <OperationPill
                op={op}
                onChange={(next) => {
                  const copy = [...operations];
                  copy[i] = next;
                  setOperations(copy);
                }}
                onRemove={() =>
                  setOperations(operations.filter((_, j) => j !== i))
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
