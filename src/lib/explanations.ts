import { getExplanationContext } from "@/data/explanation-context";
import type { IntakeAnswers } from "@/data/routing";

export interface Explanation {
  itemId: string;
  isSample: boolean;
  plainLanguage: string;
  nextSteps: string[];
  sourceId: string;
  /** Additional reviewed citations supporting next actions. */
  sourceIds?: string[];
}

/** Reviewed static fallback. Person 3 replaces this adapter with a server call. */
export async function getExplanation(
  itemId: string,
  answers?: IntakeAnswers,
): Promise<Explanation | null> {
  const context = getExplanationContext(itemId, answers);
  if (!context) return null;
  return {
    itemId,
    isSample: true,
    plainLanguage: context.item.why,
    nextSteps: [context.item.helpAction.text],
    sourceId: context.item.sourceId,
    sourceIds: context.sources.map((source) => source.id),
  };
}
