# ClearStep contributor guidance

Keep the app focused on one tax-help preparation journey. Preserve accessible controls, source attribution, and the distinction between personal reminders and official deadlines.

- Use the existing React, TypeScript, and TanStack Start structure.
- Source and checklist records: `src/data/`; explanation adapter: `src/lib/explanations.ts`; progress and calendar: `src/lib/plan-store.tsx`, `plan-logic.ts`, `calendar.ts`.
- Shared screens and branding are owned by the frontend lead. Coordinate shared interface changes before renaming IDs or state fields.
- Never place API secrets in browser code or collect sensitive tax details.
- Keep fixture explanations visibly labeled. Do not imply filing or eligibility verification.
- Run `bun run typecheck`, `bun run test`, `bun run lint`, and `bun run build` before handoff.
- Preserve published Git history. Do not commit or push unless requested.
