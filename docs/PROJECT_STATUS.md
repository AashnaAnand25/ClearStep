# ClearStep completion and remaining real-world checks

## Implemented

- Person 1: accessible frontend, custom branding, complete preparation journey.
- Person 2: six reviewed IRS sources, distinct online and appointment checklists, contextual help.
- Person 3: server-only AI endpoint, evidence grounding, schema/citation checks, timeout/cache/request budget, labelled fallback, frontend integration.
- Person 4: validated saved progress, personal/sample isolation, calendar export and regression tests.
- Littlebird: actual project-memory design review, resulting home-page scope copy, documented sponsor-use evidence.

## Verification on October 3, 2026

64 automated tests pass. Typecheck and production build pass. Lint reports zero errors and eight existing Fast Refresh warnings. Browser walkthrough verified intake, online checklist, explanation loading and the labelled fallback with two official source links. Build inspection found neither the API key nor the upstream API implementation URL in browser assets.

Automated tests cover model success with controlled responses and failure paths, not model factual accuracy. The live supplied API key was read from ignored `.env`; the upstream API returned HTTP 429 with `credit_balance_exhausted`. The actual production endpoint returned the correct labelled fallback. A funded key and a successful live model test are still required before claiming live AI works with this account.

No API key is committed. Never include `.env` in screenshots, recordings, messages or submission files.

## Final tasks that require people/accounts

- Fund the API account or replace the key locally, restart, and confirm an “AI explanation” with valid citations for both routes.
- Run actual uncoached user sessions and report observed results; do not present automated tests as user research.
- Import a downloaded reminder into a real calendar and inspect its day.
- Record the two-minute team demo, deploy the Node server with server environment variables, and submit its URL and video.
- Confirm Littlebird award eligibility/form requirements with organizers.

The repository is a runnable prototype, not a deployed or submitted entry. No filing, eligibility decisions, verified official deadlines, tax-document uploads, or notification delivery are provided.
