export interface Explanation {
  itemId: string;
  isSample: boolean;
  plainLanguage: string;
  nextSteps: string[];
  sourceId: string;
}

const SAMPLE: Record<string, Omit<Explanation, "itemId" | "isSample">> = {
  "photo-id": {
    plainLanguage:
      "This is a card with your photo and name, like a driver's license or state ID. It lets a helper confirm they're working with the right person.",
    nextSteps: [
      "Check that your ID is easy to find.",
      "If you don't have one, ask the preparation site what they accept before you go.",
    ],
    sourceId: "irs-checklist",
  },
  "ssn-cards": {
    plainLanguage:
      "Each person listed on a tax return needs an identification number. The card or letter shows that number is correct.",
    nextSteps: [
      "Gather the cards or letters for you and anyone you claim.",
      "If one is missing, the official site explains what to do.",
    ],
    sourceId: "irs-checklist",
  },
  "income-forms": {
    plainLanguage:
      "A W-2 comes from an employer. A 1099 can come from other work, a bank, or benefits. They show how much money you received last year.",
    nextSteps: [
      "Look through mail and email from early in the year.",
      "If you think a form is missing, you can ask whoever paid you.",
    ],
    sourceId: "irs-checklist",
  },
  "last-return": {
    plainLanguage:
      "Last year's return is a copy of what was filed before. It's helpful but not required, especially if this is your first time.",
    nextSteps: ["Check your files or past email.", "If you don't have it, you can still continue."],
    sourceId: "irs-checklist",
  },
  "bank-info": {
    plainLanguage:
      "Direct deposit sends a refund straight to your bank. You'd need your bank's routing number and your account number, found on a check or in your bank's app.",
    nextSteps: [
      "Decide whether you want direct deposit.",
      "Bring the details with you. Never share them with ClearStep.",
    ],
    sourceId: "irs-checklist",
  },
};

/**
 * Returns a prewritten sample explanation. Replace this with a real service later;
 * resolve null when no answer is available.
 */
export async function getExplanation(itemId: string): Promise<Explanation | null> {
  await new Promise((r) => setTimeout(r, 450));
  const found = SAMPLE[itemId];
  return found ? { itemId, isSample: true, ...found } : null;
}
