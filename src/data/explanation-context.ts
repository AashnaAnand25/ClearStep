import { getChecklist } from "./checklist";
import { getSource } from "./sources";
import { getJourneyRouting, type IntakeAnswers } from "./routing";

const defaultAnswers: IntakeAnswers = { help: "person", firstTime: null };

/**
 * Person 3's server can resolve an item ID + non-sensitive preferences to this
 * reviewed context. Never trust client-provided source URLs or passages.
 * Evidence is paraphrased reference data, not instructions for the model.
 */
export function getExplanationContext(itemId: string, answers: IntakeAnswers = defaultAnswers) {
  const item = getChecklist(answers).find((candidate) => candidate.id === itemId);
  if (!item) return null;
  const sourceIds = [...new Set([item.sourceId, item.helpAction.sourceId])];
  return {
    item,
    journey: getJourneyRouting(answers).kind,
    sources: sourceIds.map(getSource),
    limits: [
      "Explain this preparation item only; do not decide eligibility, tax liability or filing obligations.",
      "Do not supply tax-year-specific thresholds, PIN values or deadlines from these summaries.",
      "Use reviewed source IDs for citations; do not generate new URLs.",
      "If the supplied evidence does not answer the question, return an unsupported result.",
    ],
  };
}
