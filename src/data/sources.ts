/** Manually curated official pages, reviewed against their published content. */
export interface SourceRecord {
  id: string;
  title: string;
  url: string;
  domain: string;
  agency: string;
  /** A paraphrase, never represented as a direct quotation. */
  supportingExcerpt: string;
  reviewedAt: string | null;
  reviewMethod: "assistant-source-review";
  /** Section-level facts for Person 3's grounding adapter. */
  evidence: { section: string; summary: string }[];
}

export const SOURCE_REVIEW_DATE = "2026-10-03";

function irsSource(
  id: string,
  title: string,
  path: string,
  supportingExcerpt: string,
  evidence: SourceRecord["evidence"],
): SourceRecord {
  const url = new URL(path, "https://www.irs.gov");
  if (url.protocol !== "https:" || url.hostname !== "www.irs.gov" || url.username || url.password) {
    throw new Error("Source records must point to the reviewed IRS host");
  }
  return {
    id,
    title,
    url: url.href,
    domain: "irs.gov",
    agency: "Internal Revenue Service (IRS)",
    supportingExcerpt,
    evidence,
    reviewedAt: SOURCE_REVIEW_DATE,
    reviewMethod: "assistant-source-review",
  };
}

export const SOURCES: Record<string, SourceRecord> = {
  "irs-free-prep": irsSource(
    "irs-free-prep",
    "Free tax return preparation for qualifying taxpayers",
    "/individuals/free-tax-return-preparation-for-qualifying-taxpayers",
    "VITA and TCE offer free basic preparation to qualifying people. Services depend on the site. TCE particularly serves adults aged 60 and older.",
    [
      {
        section: "Program overview",
        summary:
          "IRS-certified volunteers help qualifying taxpayers through VITA and TCE. TCE specializes in retirement-related questions for older adults.",
      },
      {
        section: "Before your visit",
        summary:
          "Check the site's available services and the IRS list of documents before visiting.",
      },
      {
        section: "Find a VITA or TCE site near you",
        summary:
          "This page links to site locators. The IRS locator is updated regularly from February through April; confirm local availability.",
      },
    ],
  ),
  "irs-checklist": irsSource(
    "irs-checklist",
    "Checklist for free tax return preparation",
    "/individuals/checklist-for-free-tax-return-preparation",
    "The appointment checklist includes original photo identification, taxpayer identification records, applicable income forms, and last year's returns if available. Other documents depend on the situation.",
    [
      {
        section: "Identification",
        summary:
          "Bring original photo ID, Social Security cards or applicable ITIN documentation, and birth dates for people on the return.",
      },
      {
        section: "Income and prior returns",
        summary:
          "Bring relevant wage, benefit, interest and dividend statements; bring prior federal and state returns if available.",
      },
      {
        section: "Other documents",
        summary:
          "Direct deposit needs account and routing details. Childcare and Marketplace insurance records may apply. Joint electronic filing requires both spouses to sign at the site.",
      },
    ],
  ),
  "irs-free-file": irsSource(
    "irs-free-file",
    "IRS Free File",
    "/e-file-do-your-taxes-for-free",
    "Start through IRS.gov to access Free File offers. Guided software partners have eligibility rules; state filing may cost extra. Fillable Forms require more tax knowledge. Free File does not handle prior-year returns.",
    [
      {
        section: "How it works",
        summary:
          "Follow the IRS entry page to a partner. Going directly to a commercial provider website may not give access to its IRS Free File offer.",
      },
      {
        section: "What about it is free",
        summary:
          "Free guided federal filing depends on eligibility. State preparation may carry a fee; check the selected offer.",
      },
      {
        section: "What you need",
        summary:
          "Gather relevant records and follow the electronic signature instructions. First-time filers have a separate validation path.",
      },
      {
        section: "Prior-year returns",
        summary:
          "IRS Free File is for the currently supported tax year, not past-due returns from earlier years. This app does not determine eligibility or the supported year.",
      },
    ],
  ),
  "irs-gather-documents": irsSource(
    "irs-gather-documents",
    "Gather your documents",
    "/filing/gather-your-documents",
    "Collect identification information and applicable income and expense records for the year you are filing. Prior filing information and an IRS-issued IP PIN may also be needed.",
    [
      {
        section: "Personal information",
        summary:
          "Have taxpayer identification numbers, current name and address, prior filing information when applicable, and an IP PIN if issued. Bank details apply to direct deposit or bank payment.",
      },
      {
        section: "Forms W-2, 1099 or other information returns",
        summary:
          "W-2 forms report employment wages. Different 1099 forms report other income, such as interest, freelance work or retirement distributions.",
      },
      {
        section: "Documents for credits or deductions",
        summary:
          "Additional records may include education, childcare, insurance, contributions or other expenses, depending on the situation.",
      },
      {
        section: "Documents from side jobs and self-employment",
        summary:
          "Business income and expenses need supporting records. The short ClearStep list does not cover every situation.",
      },
    ],
  ),
  "irs-missing-w2": irsSource(
    "irs-missing-w2",
    "If you don't get a W-2 or your W-2 is wrong",
    "/filing/if-you-dont-get-a-w-2-or-your-w-2-is-wrong",
    "The IRS explains how to follow up with an employer about a missing or incorrect W-2, and when to contact the IRS for further help.",
    [
      {
        section: "If you don't get a W-2 by end of January",
        summary: "Contact the employer to find out when the form is coming.",
      },
      {
        section: "If you don't get a W-2 by end of February",
        summary:
          "If employer contact has not resolved a missing W-2, the page gives the next IRS contact step.",
      },
    ],
  ),
  "irs-efile-validation": irsSource(
    "irs-efile-validation",
    "Validating your electronically filed tax return",
    "/individuals/validating-your-electronically-filed-tax-return",
    "Electronic filing requires identity validation. The IRS explains prior-year AGI, signature PINs, and what to do if an IP PIN was issued. Follow the instructions that match your filing situation.",
    [
      {
        section: "Electronic signature overview",
        summary:
          "Prior-year AGI or a prior-year self-select PIN can validate an electronic return. An issued IP PIN is a different identifier and must be handled as directed.",
      },
      {
        section: "Finding prior-year AGI",
        summary:
          "A prior return, previous software or IRS records can help. The page includes first-time-filer instructions. Some worked examples name older tax years; do not apply those examples to a new year.",
      },
    ],
  ),
};

/** Prototype keys such as `constructor` are not source IDs. */
export function findSource(id: string): SourceRecord | undefined {
  return Object.hasOwn(SOURCES, id) ? SOURCES[id] : undefined;
}

export function getSource(id: string): SourceRecord {
  const source = findSource(id);
  if (!source) throw new Error(`Unknown official source ID: ${id}`);
  return source;
}
