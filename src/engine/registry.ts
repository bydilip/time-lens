import type { CalendarId } from "../types";
import type { CalendarAdapter } from "./types";

const REGISTRY = new Map<CalendarId, CalendarAdapter>();

export function register<F extends Record<string, number | string>>(adapter: CalendarAdapter<F>): void {
  REGISTRY.set(adapter.id, adapter as unknown as CalendarAdapter);
}

export function get(id: CalendarId): CalendarAdapter {
  const a = REGISTRY.get(id);
  if (!a) throw new Error(`No adapter registered for calendar: ${id}`);
  return a;
}

export function all(): CalendarAdapter[] {
  return Array.from(REGISTRY.values());
}

export function ids(): CalendarId[] {
  return Array.from(REGISTRY.keys());
}
