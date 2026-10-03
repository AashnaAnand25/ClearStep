import { ALL_CHECKLIST_ITEMS } from "@/data/checklist";
import { isReminderDate } from "./calendar";
import type { PlanState } from "./plan-store";

export const PLAN_STORAGE_KEY = "clearstep.plan.v1";
type PlanStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

/** Rebuild the allowlist; never copy arbitrary browser data into saved progress. */
export function normalizePlan(value: unknown): PlanState | null {
  const raw = record(value);
  if (raw["version"] !== 1 || raw["isSample"] === true) return null;
  const answers = record(raw["answers"]);
  const stages = record(raw["stagesDone"]);
  const checklist = record(raw["checklist"]);
  const help = answers["help"];
  const firstTime = answers["firstTime"];
  const validHelp = help === "person" || help === "online" || help === "unsure";
  const validFirst = firstTime === "yes" || firstTime === "no" || firstTime === "unsure";
  return {
    version: 1,
    isSample: false,
    answers: { help: validHelp ? help : null, firstTime: validFirst ? firstTime : null },
    intakeComplete: raw["intakeComplete"] === true && validHelp && validFirst,
    checklist: Object.fromEntries(
      ALL_CHECKLIST_ITEMS.map((item) => {
        const status = checklist[item.id];
        return [
          item.id,
          status === "ready" || status === "help" || (status === "skipped" && item.optional)
            ? status
            : "todo",
        ];
      }),
    ),
    stagesDone: { start: stages["start"] === true, provider: stages["provider"] === true },
    reminderDate: isReminderDate(raw["reminderDate"]) ? raw["reminderDate"] : null,
  };
}

export function readPlan(storage: PlanStorage): PlanState | null {
  try {
    return normalizePlan(JSON.parse(storage.getItem(PLAN_STORAGE_KEY) ?? "null"));
  } catch {
    return null;
  }
}

export function writePlan(storage: PlanStorage, plan: unknown): boolean {
  const safe = normalizePlan(plan);
  if (!safe) return false;
  try {
    storage.setItem(PLAN_STORAGE_KEY, JSON.stringify(safe));
    return true;
  } catch {
    return false;
  }
}

export function clearPlan(storage: PlanStorage): boolean {
  try {
    storage.removeItem(PLAN_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
