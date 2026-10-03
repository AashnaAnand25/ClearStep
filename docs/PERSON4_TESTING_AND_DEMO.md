# Person 4 testing and demo

## Actual findings

No human usability sessions have been conducted in this task. Participant count: 0; participant types: none. Automated checks are not usability sessions. No claims about older-adult usability can be made.

Code review found saved JSON was trusted via object spread, allowing unknown fields and malformed statuses to survive. Persistence now reconstructs only the allowed schema. Calendar export previously accepted impossible dates and did not fold long content lines; these are corrected with regression coverage.

Validation on October 3, 2026:

- `bun run typecheck`: passed.
- `bun run test`: 45 tests passed across 3 files. Includes route remount/resume, unfinished help priority, personal/sample isolation, reset cancellation/confirmation, external links leaving progress untouched, malformed/blocked storage, date boundaries, text escaping/folding, and Blob download cleanup.
- `bun run lint`: no errors; 8 existing Fast Refresh warnings in shared UI and store exports.
- `bun run build`: production client/server build passed. Vite reports the existing tsconfig-paths plugin advisory.
- `git diff --check`: passed.

Bun was absent initially; Bun 1.4.2 and dependencies were installed using the frozen lockfile. Checks use that Bun binary. No dependency manifests or lockfile changed.

Tests run in jsdom, not a real browser. Actual calendar-app import, cross-browser checks, human sessions, and the final narrated screen recording remain pending. The calendar tests verify exported dates/content and the download lifecycle; they do not establish that a calendar application imported the file.

## Short usability session protocol (3–5 people, 5–8 minutes each)

Use fictional sample data only. Ask permission to take anonymous notes; collect participant type (for example student, older adult, community volunteer) without names or tax details. Include older adults before making claims about that group. Avoid coaching; record any assistance.

1. “You want help preparing your taxes. Find the official place to start.” Success: identifies the IRS source and opens it; does not assume that this submits anything.
2. “You are unsure what income forms means. Find an explanation and tell me what you would do next.” Success: opens the explanation, recognizes its sample label, and identifies the official source. Mark Need help and check that the task remains unfinished.
3. “Pause here. Refresh the page and continue where you left off.” Success: finds the unfinished action and recognizes that Need help remains pending.
4. “Set a date to come back.” Observe picker use and download. Ask whether it is an official deadline or whether ClearStep sends notifications. Open the downloaded file in their calendar, inspect the date, and cancel import unless they want the event.
5. Reset the sample and check the personal plan survives. Ask: “Which words or controls were confusing?”

| Session       | Participant type | Starting point (pass/assist/fail) | Requirement (pass/assist/fail) | Resume (pass/assist/fail) | Mistakes, exact confusing wording | Time |
| ------------- | ---------------- | --------------------------------- | ------------------------------ | ------------------------- | --------------------------------- | ---- |
| P1            | Pending          | —                                 | —                              | —                         | —                                 | —    |
| P2            | Pending          | —                                 | —                              | —                         | —                                 | —    |
| P3            | Pending          | —                                 | —                              | —                         | —                                 | —    |
| P4 (optional) | Pending          | —                                 | —                              | —                         | —                                 | —    |
| P5 (optional) | Pending          | —                                 | —                              | —                         | —                                 | —    |

Report actual counts per task with denominators, assistance, recurring mistakes, and changes/retests. Never fill these rows using synthetic users or automated tests.

## Two-minute recording script for Person 1

Use a clean browser profile and fictional sample only. Hide unrelated tabs, notifications, and personal calendar information. Record 1280×720 or higher with readable text and captions.

| Time      | Screen/action                                                               | Narration                                                                                                                                 |
| --------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–0:15 | Home → Get started                                                          | “ClearStep helps you prepare for tax help, one step at a time. It does not file a return or verify eligibility.”                          |
| 0:15–0:35 | Select someone to help; first time; show IRS resource                       | “Two preference questions guide the starting point. The source and official link stay visible.”                                           |
| 0:35–0:55 | Open official link, return, manually mark stage done                        | “Opening a link changes no progress. You decide when a preparation step is done.”                                                         |
| 0:55–1:15 | Income forms → Need help → Explain this                                     | “Need help stays unfinished and becomes the next action. This explanation is visibly a sample and links to the official source.”          |
| 1:15–1:30 | Close explanation; choose reminder; download calendar                       | “Your reminder is a personal date, not a government deadline. Download an all-day calendar event. ClearStep does not send notifications.” |
| 1:30–1:45 | Refresh personal plan                                                       | “Only non-sensitive choices and progress stay in this browser. The unfinished action returns after refresh.”                              |
| 1:45–2:00 | Mark required Ready, optional not applicable, manually finish provider step | “Preparation complete means these preparation steps are finished. Continue following your provider’s instructions.”                       |

For the refresh segment use a personal plan with fictional choices, because refreshing sample mode intentionally restores the personal plan. Capture sample reset separately as an optional cutaway.

Submission assets: final MP4, captions/transcript, app URL, repository/branch, concise feature description, actual test findings, and known limitations. Person 1 must supply the final branding/story approval, deployed URL, submission destination and any required format. No final recording or submission is claimed by this document.
