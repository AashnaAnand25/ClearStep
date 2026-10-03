import { z } from "zod";
import { getExplanationContext } from "@/data/explanation-context";

export const explanationRequest = z
  .object({
    itemId: z.string().min(1).max(64),
    answers: z
      .object({
        help: z.enum(["person", "online", "unsure"]).nullable(),
        firstTime: z.enum(["yes", "no", "unsure"]).nullable(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const modelAnswer = z
  .object({
    supported: z.boolean(),
    plainLanguage: z.string().max(1200),
    nextSteps: z.array(z.string().min(1).max(600)).max(4),
    sourceIds: z.array(z.string().max(64)).max(6),
  })
  .strict();

export interface Explanation {
  itemId: string;
  isSample: boolean;
  plainLanguage: string;
  nextSteps: string[];
  sourceId: string;
  sourceIds?: string[];
}

export function sampleExplanation(input: z.infer<typeof explanationRequest>): Explanation | null {
  const context = getExplanationContext(input.itemId, input.answers);
  if (!context) return null;
  return {
    itemId: input.itemId,
    isSample: true,
    plainLanguage: context.item.why,
    nextSteps: [context.item.helpAction.text],
    sourceId: context.item.sourceId,
    sourceIds: context.sources.map((source) => source.id),
  };
}

export function validateModelAnswer(
  value: unknown,
  input: z.infer<typeof explanationRequest>,
): Explanation | null {
  const parsed = modelAnswer.safeParse(value);
  const context = getExplanationContext(input.itemId, input.answers);
  if (!parsed.success || !context) return null;
  const answer = parsed.data;
  const allowed = new Set(context.sources.map((source) => source.id));
  if (
    !answer.supported ||
    !answer.plainLanguage.trim() ||
    !answer.nextSteps.length ||
    !answer.sourceIds.includes(context.item.sourceId) ||
    answer.sourceIds.some((id) => !allowed.has(id)) ||
    /https?:\/\/|www\./i.test([answer.plainLanguage, ...answer.nextSteps].join(" "))
  )
    return null;
  return {
    itemId: input.itemId,
    isSample: false,
    plainLanguage: answer.plainLanguage,
    nextSteps: answer.nextSteps,
    sourceId: context.item.sourceId,
    sourceIds: [...new Set(answer.sourceIds)],
  };
}
