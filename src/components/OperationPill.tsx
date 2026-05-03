import type { Operation } from "../types";

type Props = {
  op: Operation;
  onChange: (next: Operation) => void;
  onRemove: () => void;
};

function describe(op: Operation): string {
  switch (op.kind) {
    case "add":
    case "sub":
      return `${op.kind === "add" ? "+" : "-"}${op.amount} ${op.unit}`;
    case "skip":
      return `skip ${op.what}`;
    case "next":
      return `next ${op.target}`;
    case "prev":
      return `prev ${op.target}`;
    case "diff":
      return `diff in ${op.in}`;
    case "convert":
      return `to ${op.to}`;
  }
}

export default function OperationPill({ op, onChange, onRemove }: Props) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 px-3 py-1 text-xs font-mono">
      {op.kind === "add" || op.kind === "sub" ? (
        <>
          <select
            value={op.kind}
            onChange={(e) =>
              onChange({ ...op, kind: e.target.value as "add" | "sub" })
            }
            className="bg-transparent outline-none"
          >
            <option value="add">+</option>
            <option value="sub">-</option>
          </select>
          <input
            type="number"
            value={op.amount}
            onChange={(e) => onChange({ ...op, amount: Number(e.target.value) })}
            className="w-12 bg-transparent outline-none"
          />
          <select
            value={op.unit}
            onChange={(e) => onChange({ ...op, unit: e.target.value as Operation["unit"] & string })}
            className="bg-transparent outline-none"
          >
            <option value="day">day</option>
            <option value="week">week</option>
            <option value="month">month</option>
            <option value="year">year</option>
            <option value="business-day">business-day</option>
          </select>
        </>
      ) : (
        <span>{describe(op)}</span>
      )}
      <button
        onClick={onRemove}
        className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
        aria-label="Remove operation"
      >
        ×
      </button>
    </span>
  );
}
