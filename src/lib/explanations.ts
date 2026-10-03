import type { IntakeAnswers } from "@/data/routing";
import {
  explanationRequest,
  sampleExplanation,
  validateModelAnswer,
  type Explanation,
} from "./explanation-contract";
export type { Explanation } from "./explanation-contract";

export async function getExplanation(
  itemId: string,
  answers?: IntakeAnswers,
): Promise<Explanation | null> {
  const parsed = explanationRequest.safeParse({ itemId, answers });
  if (!parsed.success) return null;
  const fallback = sampleExplanation(parsed.data);
  if (!fallback) return null;
  try {
    const response = await fetch("/api/explanations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return fallback;
    const result = await response.json();
    if (result?.itemId !== itemId || result.isSample !== false) return fallback;
    return (
      validateModelAnswer(
        {
          supported: true,
          plainLanguage: result.plainLanguage,
          nextSteps: result.nextSteps,
          sourceIds: result.sourceIds,
        },
        parsed.data,
      ) ?? fallback
    );
  } catch {
    return fallback;
  }
}
