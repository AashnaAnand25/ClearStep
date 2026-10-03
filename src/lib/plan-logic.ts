import { CHECKLIST } from "@/data/checklist";
import type { HelpChoice, PlanState } from "./plan-store";

export function startingSourceId(help: HelpChoice | null): string {
  return help === "online" ? "irs-free-file" : "irs-free-prep";
}

export function prepDone(plan: PlanState) {
  return CHECKLIST.every(
    (i) => plan.checklist[i.id] === "ready" || (i.optional && plan.checklist[i.id] === "skipped"),
  );
}

export type NextStep =
  | { kind: "start"; stage: 1 }
  | { kind: "item"; stage: 2; itemId: string; needsHelp: boolean }
  | { kind: "provider"; stage: 3 }
  | { kind: "complete"; stage: 3 };

export function getNextStep(plan: PlanState): NextStep {
  if (!plan.stagesDone.start) return { kind: "start", stage: 1 };
  const help = CHECKLIST.find((i) => plan.checklist[i.id] === "help");
  if (help) return { kind: "item", stage: 2, itemId: help.id, needsHelp: true };
  const todo = CHECKLIST.find((i) => plan.checklist[i.id] === "todo");
  if (todo) return { kind: "item", stage: 2, itemId: todo.id, needsHelp: false };
  if (!plan.stagesDone.provider) return { kind: "provider", stage: 3 };
  return { kind: "complete", stage: 3 };
}

export function completedStages(plan: PlanState) {
  return [plan.stagesDone.start, prepDone(plan), plan.stagesDone.provider].filter(Boolean).length;
}
