export const FORM_FIELDS = {
  "multiple-jobs": {
    label: "Multiple jobs or spouse works",
    step: "W-4 · Step 2",
    evidence:
      "Step 2 addresses simultaneous jobs or joint filers whose spouse works. IRS offers an estimator, a worksheet, and a two-job checkbox option with conditions. Review the official instructions before selecting an option.",
    find: "Have current pay stubs available for the IRS withholding estimator. Review Step 2 in the official W-4 instructions.",
  },
  "other-income": {
    label: "Other income (not from jobs)",
    step: "W-4 · Step 4(a)",
    evidence:
      "This optional adjustment concerns estimated annual income without withholding, such as interest, dividends or retirement income. Job and self-employment income do not belong in Step 4(a). Follow the instructions for your situation.",
    find: "Review records of interest, dividends or retirement income and the official Step 4(a) instructions. Do not include pay from jobs or self-employment here.",
  },
  "extra-withholding": {
    label: "Extra withholding",
    step: "W-4 · Step 4(c)",
    evidence:
      "Step 4(c) is an additional amount of federal tax withheld each pay period. It is not an annual figure. The Multiple Jobs Worksheet can produce an amount for this field. ClearStep cannot choose an amount for you.",
    find: "Check the official Step 4(c) instructions and, if applicable, the Multiple Jobs Worksheet. Use the IRS estimator for your own situation.",
  },
} as const;
export type FormFieldId = keyof typeof FORM_FIELDS;
export const FORM_SOURCE = {
  title: "IRS Form W-4 · 2026 instructions",
  url: "https://www.irs.gov/pub/irs-pdf/fw4.pdf",
  reviewedAt: "2026-10-03",
  reviewMethod: "assistant-source-review",
};
