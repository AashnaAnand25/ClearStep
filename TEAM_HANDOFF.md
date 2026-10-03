# ClearStep team handoff

## Frontend baseline (Person 1)

The screens, logo, navigation, source cards, intake validation, explanation drawer, checklist controls, reminders, empty/error states, text-size toggle, and reset confirmation are integrated. Use this working baseline rather than regenerating the app. Content and explanations remain prototype fixtures so their owners can replace them deliberately.

Do not independently rename shared IDs, add extra journeys, or rebuild shared pages. Agree interface changes with Person 1 first. Integrate each feature early in a small commit.

## Person 2: resources and routing

Own:

- `src/data/sources.ts`: `SourceRecord`, `SOURCES`, `getSource(id)`.
- `src/data/checklist.ts`: `ChecklistItemRecord`, `CHECKLIST`.
- `src/data/dates.ts`: `getVerifiedDeadlines()`.
- `startingSourceId()` in `src/lib/plan-logic.ts` (coordinate with Person 4, who owns the remaining progress rules).

Source format: `id`, `title`, `url`, `domain`, `agency`, `supportingExcerpt` (a summary, not an exact quote), `reviewedAt` (null until reviewed). Checklist format: `id`, `label`, `why`, `sourceId`, optional `optional: true`.

Stable source IDs: `irs-free-prep`, `irs-checklist`, `irs-free-file`.
Stable item IDs: `photo-id`, `ssn-cards`, `income-forms`, `last-return`, `bank-info`.

Review all prototype wording against current sources, especially optional or conditional items. The current starter checklist is based on an in-person preparation source; determine how it should differ for an online-filing preference before claiming it is tailored. Do not treat this as a complete personal requirements list. Supply reviewed excerpts to Person 3. Keep dates empty unless applicable, verified, and linked to a source. Source links are manually curated; this is not a scam detector or an eligibility engine.

## Person 3: explanations

Own `src/lib/explanations.ts` and your new server-only endpoint. Coordinate presentation changes to `src/components/clearstep/ExplainPanel.tsx` with Person 1.

Preserve the existing adapter:

```ts
getExplanation(itemId: string): Promise<Explanation | null>
// Explanation:
// { itemId, isSample: boolean, plainLanguage, nextSteps: string[], sourceId }
```

The panel already supports loading, failure, missing answers, sample/live labels, and official source links. Unknown source IDs are rejected by the panel. Return null for unsupported answers. If you need multiple source IDs, coordinate the small type/UI change first rather than silently breaking this interface. Resolve links using Person 2's source records, not model-generated URLs.

Keep credentials on the server. No keys are needed to run the current fixtures. Leave `isSample: true` on fallback fixtures; set false only for actual supported service answers. Use only approved passages and test unsupported requests, invalid source IDs, and outages.

## Person 4: progress, reminders, usability, demo

Own `src/lib/plan-store.tsx`, progress functions in `src/lib/plan-logic.ts`, `src/lib/calendar.ts`, and progress tests. Coordinate UI changes to `/plan` with Person 1.

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
