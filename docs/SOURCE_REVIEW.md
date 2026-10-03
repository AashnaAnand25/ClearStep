# Person 2 source review

Reviewed on **October 3, 2026 (America/Chicago)** by the coding assistant against the official pages below. All six canonical URLs returned HTTP 200 in a separate link check. This is an assistant content review, not a human tax-professional audit or government approval. Review dates are fixed records, not automatically updated on app load.

## Source register

The machine-readable register is `src/data/sources.ts`. Each source has a canonical URL, agency, date, review method, summary, and section-level evidence. Summaries are paraphrases, not copied source excerpts.

| ID                     | Official page                                                                                            | Use                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `irs-free-prep`        | [Free preparation](https://www.irs.gov/individuals/free-tax-return-preparation-for-qualifying-taxpayers) | Human-help starting point, program scope, site availability |
| `irs-checklist`        | [Preparation checklist](https://www.irs.gov/individuals/checklist-for-free-tax-return-preparation)       | Appointment records and conditional items                   |
| `irs-free-file`        | [IRS Free File](https://www.irs.gov/e-file-do-your-taxes-for-free)                                       | Online starting point, provider handoff and limitations     |
| `irs-gather-documents` | [Gather your documents](https://www.irs.gov/filing/gather-your-documents)                                | Online preparation and income records                       |
| `irs-missing-w2`       | [Missing or incorrect W-2](https://www.irs.gov/filing/if-you-dont-get-a-w-2-or-your-w-2-is-wrong)        | Missing-form next action                                    |
| `irs-efile-validation` | [Electronic validation](https://www.irs.gov/individuals/validating-your-electronically-filed-tax-return) | Electronic signature preparation                            |

## Decisions from the review

- Split appointment and online checklists. The online flow no longer presents physical appointment documents as universal online requirements.
- Preserve the old IDs and introduce `efile-identity` and `efile-signature`. These represent different tasks from appointment photo ID and a prior-return copy, so old completed states are not silently reused for them.
- Keep income records and direct-deposit preparation shared. Only prior-return availability and choosing direct deposit offer a conditional skip in the relevant journey.
- Keep first-time status as an explanation preference. It does not establish eligibility, residency, income, age, or whether filing is required.
- Keep the catalog small. Additional situation-dependent documents remain in the linked full IRS guides, not hidden behind a claim of a complete personalized checklist.
- Route users through the official Free File entry page instead of a commercial provider's home page.
- Keep official deadlines empty. Intake does not determine tax year, location, extension status, or disaster relief. A calendar export remains a user-selected reminder.

## Important ambiguities and exclusions

The appointment checklist's ITIN entry contains a CP-01A cross-link. The electronic-validation page identifies CP01A with an IP PIN. Do not teach that an ITIN notice and IP PIN notice are interchangeable. ClearStep uses general ITIN-documentation wording and refers uncertain cases to the official preparation site.

The electronic-validation page contains examples mentioning earlier tax years. Do not turn those examples into current-year instructions or fill in an AGI/PIN value for a user. First-time users are pointed to the official instructions and provider.

The Free File page includes an income threshold that may change and provider-specific restrictions. The app deliberately does not encode a threshold, promise that a user qualifies, or promise free state filing. It also does not decide which year a person should file for.

This prototype is not a full international/nonresident, business, amended-return, prior-year-return or state-tax workflow. No eligibility or residency determination is made. If a question goes beyond the evidence supplied for an item, the explanation service must return an unsupported answer and preserve the official link.

A source date and successful link check establish what was inspected at review time. They are not continuous freshness monitoring or proof that every downstream provider is suitable for every user.

## Person 3's context interface

Use `getExplanationContext(itemId, answers)` from `src/data/explanation-context.ts`. It returns the active checklist item, journey kind, only its relevant reviewed sources, and answer limits. Unknown items and items outside the selected journey return null.

Resolve context on the server. Treat source summaries as reference data, not executable instructions. Validate request choices and response structure. Restrict model citations to the returned source IDs, never accept URLs or source passages from the browser. A known source ID alone does not prove an answer is supported; check the actual statements against the returned evidence.

The existing static adapter uses the same context, so it covers both routes and stays correctly labeled as a sample until the live service is added. The frontend supports multiple citations through optional `sourceIds` while retaining primary `sourceId` for compatibility.
