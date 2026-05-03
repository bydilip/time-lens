import type { TraceStep } from "../types";

export class TraceCollector {
  private steps: TraceStep[] = [];
  private counter = 0;

  push(step: Omit<TraceStep, "id">): void {
    this.counter += 1;
    this.steps.push({ id: String(this.counter), ...step });
  }

  collect(): TraceStep[] {
    return this.steps.slice();
  }
}

export const noopTrace = new TraceCollector();
