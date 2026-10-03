export interface ChecklistItemRecord {
  id: string;
  label: string;
  why: string;
  sourceId: string;
  optional?: boolean;
}

/** Starter preparation items, based on the IRS free preparation checklist. */
export const CHECKLIST: ChecklistItemRecord[] = [
  {
    id: "photo-id",
    label: "A photo ID",
    why: "Helpers need to confirm who you are before preparing a return with you.",
    sourceId: "irs-checklist",
  },
  {
    id: "ssn-cards",
    label: "Social Security cards or ITIN letters",
    why: "A return lists an identification number for each person on it. Bring the cards or letters; ClearStep never asks for the numbers.",
    sourceId: "irs-checklist",
  },
  {
    id: "income-forms",
    label: "Income forms, such as a W-2 or 1099",
    why: "These forms show what you earned during the year. Employers and others usually send them early in the year.",
    sourceId: "irs-checklist",
  },
  {
    id: "last-return",
    optional: true,
    label: "Last year's tax return, if you have it",
    why: "It can help a helper or software fill in details correctly. It's fine if you don't have one.",
    sourceId: "irs-checklist",
  },
  {
    id: "bank-info",
    optional: true,
    label: "Bank account details for direct deposit",
    why: "If you're owed a refund, it can be sent straight to your bank account. This is optional.",
    sourceId: "irs-checklist",
  },
];
