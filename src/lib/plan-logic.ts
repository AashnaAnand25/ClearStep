import { getChecklist, type ChecklistItemRecord } from "@/data/checklist";
import { getJourneyRouting } from "@/data/routing";
import type { HelpChoice, PlanState } from "./plan-store";

export function startingSourceId(help: HelpChoice | null): string {
  return getJourneyRouting({ help, firstTime: null }).sourceId;
}

function itemDone(item: ChecklistItemRecord, plan: PlanState): boolean {
  return (
    plan.checklist[item.id] === "ready" ||
    (item.optional === true && plan.checklist[item.id] === "skipped")
  );
}

export function prepDone(plan: PlanState) {
  return getChecklist(plan.answers).every((item) => itemDone(item, plan));
}

export type NextStep =
  | { kind: "start"; stage: 1 }
  | { kind: "item"; stage: 2; itemId: string; needsHelp: boolean }
  | { kind: "provider"; stage: 3 }
  | { kind: "complete"; stage: 3 };

export function getNextStep(plan: PlanState): NextStep {
  if (!plan.stagesDone.start) return { kind: "start", stage: 1 };
  const checklist = getChecklist(plan.answers);
  const help = checklist.find((i) => plan.checklist[i.id] === "help");
  if (help) return { kind: "item", stage: 2, itemId: help.id, needsHelp: true };
  const todo = checklist.find((item) => !itemDone(item, plan));
  if (todo) return { kind: "item", stage: 2, itemId: todo.id, needsHelp: false };
  if (!plan.stagesDone.provider) return { kind: "provider", stage: 3 };
  return { kind: "complete", stage: 3 };
}

export function completedStages(plan: PlanState) {
  return [plan.stagesDone.start, prepDone(plan), plan.stagesDone.provider].filter(Boolean).length;
}
