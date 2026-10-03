/** Official source records. reviewedAt stays null until an actual human review happens. */
export interface SourceRecord {
  id: string;
  title: string;
  url: string;
  domain: string;
  agency: string;
  /** Short plain-language summary of what the source says (not a verbatim quote). */
  supportingExcerpt: string;
  reviewedAt: string | null;
}

export const SOURCES: Record<string, SourceRecord> = {
  "irs-free-prep": {
    id: "irs-free-prep",
    title: "Free tax return preparation for qualifying taxpayers",
    url: "https://www.irs.gov/individuals/free-tax-return-preparation-for-qualifying-taxpayers",
    domain: "irs.gov",
    agency: "Internal Revenue Service (IRS)",
    supportingExcerpt:
      "Describes IRS-supported programs where trained volunteers prepare tax returns for free for people who qualify, and how to find a location.",
    reviewedAt: null,
  },
  "irs-checklist": {
    id: "irs-checklist",
    title: "Checklist for free tax return preparation",
    url: "https://www.irs.gov/individuals/checklist-for-free-tax-return-preparation",
    domain: "irs.gov",
    agency: "Internal Revenue Service (IRS)",
    supportingExcerpt:
      "Lists documents and information to bring when visiting a free tax preparation site, such as identification and income statements.",
    reviewedAt: null,
  },
  "irs-free-file": {
    id: "irs-free-file",
    title: "IRS Free File",
    url: "https://www.irs.gov/freefile",
    domain: "irs.gov",
    agency: "Internal Revenue Service (IRS)",
    supportingExcerpt:
      "Explains IRS Free File, which offers online tax preparation software at no cost for people who meet certain requirements.",
    reviewedAt: null,
  },
};

export function getSource(id: string): SourceRecord {
  return SOURCES[id];
}
