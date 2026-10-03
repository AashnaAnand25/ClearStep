# Person 4 → Person 1: integration contract

Branch: `feature/progress-reminders`. No shared IDs or state fields renamed.

Person 2 coordination uses the completed ID contract in TEAM_HANDOFF.md: `photo-id`, `ssn-cards`, `income-forms`, `last-return`, `bank-info`, `efile-identity`, `efile-signature`. Only `getChecklist(plan.answers)` determines active progress; missing IDs start unfinished.

## First handoff

Existing `PlanState` version 1 is retained: `answers` (enumerated help and first-time choices), `intakeComplete`, `checklist` (known IDs → `todo | help | ready | skipped`), `stagesDone` (`start`, `provider`), `reminderDate` (`YYYY-MM-DD | null`), and temporary `isSample`. Labels remain Not started / Need help / Ready. Skipped applies only to optional items.

`usePlan()` retains `plan`, `hydrated`, `welcomeBack`, `dismissWelcome`, `update`, `startFresh`, `loadSample`, `leaveSample`, `reset`, `largeText`, and `setLargeText`. No integration changes required. Current step is derived with `getNextStep(plan)` from persisted stage flags and statuses, avoiding a second cursor that could become stale. Need help is unfinished and prioritized within preparation.

Persistence helpers in `src/lib/plan-persistence.ts`: `normalizePlan(value)`, `readPlan(storage)`, `writePlan(storage, plan)`, `clearPlan(storage)`, and `PLAN_STORAGE_KEY`. Helpers accept a Storage-compatible object for testing; unavailable storage is handled by the provider. Only allowlisted fields are persisted. Unknown IDs/fields are discarded; invalid dates/statuses reset safely. Sample plans are never persisted.

`buildReminderIcs(date, title, description)` produces an all-day event with exclusive next-day end; invalid dates throw RangeError. `downloadIcs(filename, content)` downloads through a temporary object URL. The existing native date picker is integrated. This is a personal reminder, not an official deadline; no email/push delivery.

This file is the early reviewable handoff for Person 1. No direct teammate channel was supplied; receipt and final demo coordination remain pending.
