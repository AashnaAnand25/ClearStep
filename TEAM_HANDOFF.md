# ClearStep team handoff

## Frontend baseline (Person 1)

The screens, logo, navigation, source cards, intake validation, explanation drawer, checklist controls, reminders, empty/error states, text-size toggle, and reset confirmation are integrated. Use this working baseline rather than regenerating the app. Sources and checklist content are now reviewed for the defined scope; explanations remain labeled static samples for Person 3 to replace.

Do not independently rename shared IDs, add extra journeys, or rebuild shared pages. Agree interface changes with Person 1 first. Integrate each feature early in a small commit.

## Person 2: complete — reviewed sources, routing, checklists

Completed on October 3, 2026. Six official IRS source pages were inspected and their canonical links checked. Review provenance is explicitly `assistant-source-review`; this is not a tax-professional audit. See [the source review](docs/SOURCE_REVIEW.md) for sources, ambiguities, and exclusions.

Files now ready:

- `src/data/sources.ts`: six sources with review dates, summaries and section-level evidence; safe `findSource` and strict `getSource` lookups.
- `src/data/routing.ts`: `getJourneyRouting(answers)` returns journey kind, source IDs, rationale, caveats, and checklist introduction. First-time status never determines eligibility.
- `src/data/checklist.ts`: `getChecklist(answers)` returns five appointment items or four online items. `ALL_CHECKLIST_ITEMS` is the union for storage. `CHECKLIST` remains the default appointment list for compatibility, but must not drive active-plan progress.
- `src/data/explanation-context.ts`: reviewed source context for Person 3.
- `src/data/dates.ts`: intentionally no official deadlines without enough applicability information.

Original IDs remain stable: `photo-id`, `ssn-cards`, `income-forms`, `last-return`, `bank-info`. Online-only IDs: `efile-identity`, `efile-signature`. Each item has `helpAction: { text, sourceId, linkLabel }` and conditional items have `optional` plus `condition`.

Both routes are integrated into the page, progress calculations, and fallback explanations. Previously saved plans receive missing IDs as unfinished work. Person 2's implementation is ready; no backend or credentials are needed for it.

## Person 3: explanations

Own `src/lib/explanations.ts` and your new server-only endpoint. Coordinate presentation changes to `src/components/clearstep/ExplainPanel.tsx` with Person 1.

Preserve the existing adapter:

```ts
getExplanation(itemId: string, answers?: IntakeAnswers): Promise<Explanation | null>
// Explanation:
// { itemId, isSample: boolean, plainLanguage, nextSteps: string[], sourceId, sourceIds?: string[] }
```

The panel already supports loading, failure, missing answers, sample/live labels, and official source links. Unknown source IDs are rejected by the panel. Return null for unsupported answers. Multiple citations are already supported with optional `sourceIds`. Resolve links using Person 2's source records, not model-generated URLs.

**Start here:** call `getExplanationContext(itemId, answers)` in your server endpoint to obtain the selected item and its reviewed source evidence. The page passes the intake answers to the adapter. Preserve those choices so online users receive online explanations. Validate inputs and restrict returned citations to the context's source IDs.

Keep credentials on the server. No keys are needed to run the current fixtures. Leave `isSample: true` on fallback fixtures; set false only for actual supported service answers. Use only approved passages and test unsupported requests, invalid source IDs, and outages.

## Person 4: progress, reminders, usability, demo

Own `src/lib/plan-store.tsx`, progress functions in `src/lib/plan-logic.ts`, `src/lib/calendar.ts`, and progress tests. Coordinate UI changes to `/plan` with Person 1.

**Person 2 integration note:** progress must use `getChecklist(plan.answers)`, not the default `CHECKLIST`. Storage initializes all IDs, including online-only ones; inactive items must not block the current route. Missing required states and illegal skips are treated as unfinished work.

The existing store exposes `plan`, `hydrated`, `welcomeBack`, `update`, `startFresh`, `loadSample`, `leaveSample`, `reset`, `largeText`, and `setLargeText`.

`PlanState` uses version 1, intake answers, item statuses (`todo | ready | help | skipped`), stage completion flags, and a personal `reminderDate` string or null. Only optional checklist items offer `skipped`. Preserve existing users' progress if extending the schema.

Personal progress persists under `clearstep.plan.v1`; text preference under `clearstep.largeText`. Sample mode is temporary and keeps the personal plan intact. Returning from sample restores it; refreshing a sample restores the personal plan instead. Invalid/unavailable storage must not crash the app. Opening a link must never mark a stage complete.

Calendar export already generates an all-day `.ics`. Validate date boundaries, calendar import, and browsers. Reminders are user-selected dates; the app does not send notifications itself.

Run 3–5 usability sessions and record actual completion/errors. Include older adults if making claims about their usability; student-only tests do not establish that. Own the two-minute recording and submission assets, coordinating the final story with Person 1.

## Quick demo and acceptance checks

1. Start on `/`; choose Get started. Continue without answering to check validation.
2. Choose a person to help, then first-time filing. Confirm the IRS preparation resource appears.
3. Mark the first stage done. Select Need help on income forms. The next-step card should now prioritize that item.
4. Open Explain this; check the sample label and official source. Escape closes the panel.
5. Mark required items Ready and optional items not applicable. Continue with the provider and manually confirm completion. The final state says Preparation complete.
6. Select a reminder date and download its calendar event. No official deadline should be invented.
7. Reload and verify progress returns. Try a sample and leave it; the personal plan must survive.
8. Check narrow screens, larger text, keyboard-only navigation, and reset cancellation/confirmation.

No login, uploads, eligibility calculations, live crawling, or extra government services are required for the hackathon baseline.

## Person 4 implementation handoff — October 3, 2026

Work is on `feature/progress-reminders`. The existing controls and shared layout are preserved. See [the early state/persistence contract](docs/PERSON4_HANDOFF.md) and [actual test findings, usability protocol, and demo script](docs/PERSON4_TESTING_AND_DEMO.md).

Added allowlisted version-1 storage helpers in `src/lib/plan-persistence.ts`, integrated into the provider, and validated all-day calendar export with date-boundary, escaping and UTF-8 folding coverage. All 45 tests and typechecking pass; lint has no errors (8 existing warnings); production build passes. Stable checklist IDs follow Person 2's completed handoff. No participant sessions, real calendar-app import, final recording, or direct Person 1 receipt are claimed. Those require participants and final recording/submission coordination.
