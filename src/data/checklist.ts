import { getJourneyRouting, type IntakeAnswers } from "./routing";

export interface ChecklistItemRecord {
  id: string;
  label: string;
  why: string;
  sourceId: string;
  optional?: boolean;
  /** A conditional item can be skipped only when the described condition does not apply. */
  condition?: string;
  helpAction: { text: string; sourceId: string; linkLabel: string };
}

const photoId: ChecklistItemRecord = {
  id: "photo-id",
  label: "A photo ID",
  why: "The IRS appointment checklist asks for original photo identification, such as a school ID, driver's license or passport.",
  sourceId: "irs-checklist",
  helpAction: {
    text: "Review the accepted examples and check with the site if you do not have one.",
    sourceId: "irs-checklist",
    linkLabel: "Check the IRS appointment list",
  },
};
const cards: ChecklistItemRecord = {
  id: "ssn-cards",
  label: "Social Security cards or ITIN documentation",
  why: "Bring identification records for the people on the return. ClearStep does not ask you to enter these numbers.",
  sourceId: "irs-checklist",
  helpAction: {
    text: "Use the IRS checklist to check the records to bring. It also links to Social Security card replacement help.",
    sourceId: "irs-checklist",
    linkLabel: "Check identification requirements",
  },
};
const income: ChecklistItemRecord = {
  id: "income-forms",
  label: "Income forms, such as a W-2 or 1099",
  why: "A W-2 comes from an employer. Other income can appear on different 1099 forms. Gather the records for the year you are filing.",
  sourceId: "irs-gather-documents",
  helpAction: {
    text: "If a W-2 is missing or incorrect, follow the IRS steps for contacting your employer and getting further help.",
    sourceId: "irs-missing-w2",
    linkLabel: "Get help with a missing W-2",
  },
};
const priorReturn: ChecklistItemRecord = {
  id: "last-return",
  label: "Last year's tax return, if you have it",
  optional: true,
  condition: "Bring it if available. If you have never filed, this item does not apply.",
  why: "The appointment checklist requests last year's federal and state returns if available.",
  sourceId: "irs-checklist",
  helpAction: {
    text: "If you do not have a prior return, tell the preparation site and check what else it needs.",
    sourceId: "irs-free-prep",
    linkLabel: "Check the site's requirements",
  },
};
const bank: ChecklistItemRecord = {
  id: "bank-info",
  label: "Bank account details for direct deposit",
  optional: true,
  condition: "Applies if you choose direct deposit for a refund.",
  why: "Direct deposit uses a bank account number and routing number. Keep those details private; do not enter them in ClearStep.",
  sourceId: "irs-gather-documents",
  helpAction: {
    text: "Read the IRS document guide and its direct-deposit information before choosing how to receive a refund.",
    sourceId: "irs-gather-documents",
    linkLabel: "Review bank-detail guidance",
  },
};
const onlineIdentity: ChecklistItemRecord = {
  id: "efile-identity",
  label: "Your taxpayer identification information",
  why: "Have the Social Security number or ITIN, name and current address needed for your return. Enter them only with your chosen filing service.",
  sourceId: "irs-gather-documents",
  helpAction: {
    text: "Review the personal-information section of the IRS document guide. ClearStep does not collect these details.",
    sourceId: "irs-gather-documents",
    linkLabel: "Review the IRS document guide",
  },
};
const onlineSignature: ChecklistItemRecord = {
  id: "efile-signature",
  label: "Check how to sign your electronic return",
  why: "Electronic filing has an identity-validation step. Prior filing information or an issued IP PIN may be needed. Follow the instructions for your situation.",
  sourceId: "irs-efile-validation",
  helpAction: {
    text: "Read the IRS validation instructions with your chosen provider. An IP PIN and a self-select signature PIN are different.",
    sourceId: "irs-efile-validation",
    linkLabel: "Read electronic signature guidance",
  },
};

/** Backward-compatible default for the assisted journey; use getChecklist in UI/progress. */
export const CHECKLIST: ChecklistItemRecord[] = [photoId, cards, income, priorReturn, bank];
export const ALL_CHECKLIST_ITEMS: ChecklistItemRecord[] = [
  ...CHECKLIST,
  onlineIdentity,
  onlineSignature,
];

export function getChecklist(answers: IntakeAnswers): ChecklistItemRecord[] {
  if (getJourneyRouting(answers).kind === "online") {
    const signature =
      answers.firstTime === "yes"
        ? {
            ...onlineSignature,
            why: "If you have never filed, follow the IRS first-time-filer instructions for signing an electronic return. Do not guess a previous year's income or a PIN.",
          }
        : onlineSignature;
    return [onlineIdentity, income, signature, bank];
  }
  return CHECKLIST;
}
