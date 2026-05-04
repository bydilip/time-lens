import type { Operation, Query } from "../types";

type ArithmeticUnit = Extract<Operation, { kind: "add" | "sub" }>["unit"];

const MONTHS: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

export function parseNaturalLanguageQuery(text: string): Query {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (!normalized) {
    throw new Error("Enter a date command.");
  }

  const addTo = normalized.match(
    /^(add|subtract)\s+(\d+)\s+([a-z -]+?)\s+(?:to|from)\s+(.+)$/i,
  );
  if (addTo) {
    const kind = addTo[1].toLowerCase() === "subtract" ? "sub" : "add";
    return buildQuery(kind, addTo[2], addTo[3], addTo[4]);
  }

  const relative = normalized.match(
    /^(\d+)\s+([a-z -]+?)\s+(after|before)\s+(.+)$/i,
  );
  if (relative) {
    const kind = relative[3].toLowerCase() === "before" ? "sub" : "add";
    return buildQuery(kind, relative[1], relative[2], relative[4]);
  }

  throw new Error(
    'Unsupported command. Try "add 5 days to Jan 10 2026" or "10 days after 2026-01-10".',
  );
}

function buildQuery(
  kind: "add" | "sub",
  amountText: string,
  unitText: string,
  dateText: string,
): Query {
  const amount = Number(amountText);
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Amount must be a positive whole number.");
  }

  return {
    input: {
      calendar: "gregorian",
      fields: parseGregorianDate(dateText),
    },
    operations: [
      {
        kind,
        amount,
        unit: parseUnit(unitText),
      },
    ],
  };
}

function parseUnit(unitText: string): ArithmeticUnit {
  const unit = unitText.toLowerCase().replace(/-/g, " ").trim();

  if (unit === "day" || unit === "days") return "day";
  if (unit === "week" || unit === "weeks") return "week";
  if (unit === "month" || unit === "months") return "month";
  if (unit === "year" || unit === "years") return "year";
  if (unit === "business day" || unit === "business days") return "business-day";

  throw new Error("Unsupported unit. Use days, weeks, months, years, or business days.");
}

function parseGregorianDate(dateText: string): Record<string, number> {
  const date = dateText.trim();

  const iso = date.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    return validateGregorianDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }

  const monthName = date.match(/^([a-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})$/i);
  if (monthName) {
    const month = MONTHS[monthName[1].toLowerCase()];
    if (!month) {
      throw new Error("Unknown month name.");
    }
    return validateGregorianDate(Number(monthName[3]), month, Number(monthName[2]));
  }

  throw new Error("Unsupported date format. Use YYYY-MM-DD or Jan 10 2026.");
}

function validateGregorianDate(y: number, m: number, d: number): Record<string, number> {
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) {
    throw new Error("Date must use whole-number year, month, and day values.");
  }

  if (m < 1 || m > 12) {
    throw new Error("Month must be between 1 and 12.");
  }

  const maxDay = daysInMonth(y, m);
  if (d < 1 || d > maxDay) {
    throw new Error(`Day must be between 1 and ${maxDay} for that month.`);
  }

  return { y, m, d };
}

function daysInMonth(y: number, m: number): number {
  if (m === 2) return isGregorianLeapYear(y) ? 29 : 28;
  return [4, 6, 9, 11].includes(m) ? 30 : 31;
}

function isGregorianLeapYear(y: number): boolean {
  return y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
}
