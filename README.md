# ClearStep

Government paperwork, one clear next step.

An accessible tax-help preparation prototype for people with low confidence using government websites. The frontend includes a two-question intake, official-resource cards, contextual explanations, a starter checklist, personal calendar reminders, and browser-local progress.

## Run locally

Requires Node.js 22.12+ and Bun 1.3+ (the committed lockfile is `bun.lock`).

```sh
bun install --frozen-lockfile
bun run dev
```

Open http://127.0.0.1:3000. No account, API key, or environment variables are needed for the prototype.

```sh
bun run typecheck
bun run test
bun run lint
bun run build
bun run start
```

`build` produces a Node server in `.output/`; `start` serves that build. Set `PORT` when another app already uses port 3000. Development uses TanStack Start, React 19, TypeScript, Tailwind 4, and Vite. Keep `bun.lock` committed and use one package manager to avoid competing lockfiles.

## Current scope

- Three screens: `/`, `/intake`, `/plan`.
- Human-help and online-filing preferences lead to distinct IRS resources.
- Explanations are labeled, prewritten fixtures. There is no live AI service yet.
- Six official IRS pages were reviewed by the assistant on October 3, 2026; provenance and limitations are in [docs/SOURCE_REVIEW.md](docs/SOURCE_REVIEW.md).
- Appointment and online choices have distinct source-backed starter checklists.
- No official deadline is supplied. Calendar exports are personal reminders.
- Checklist completion means preparation, never submission or tax filing.
- Progress is stored only in this browser. Sample mode does not overwrite a personal plan and is intentionally not persisted across reloads.
- Optional items can be marked as not applicable. Provider-specific requirements still need review.

See [TEAM_HANDOFF.md](TEAM_HANDOFF.md) for exact files, interfaces, and remaining work for Persons 2–4.

## Design

Warm neutral surfaces, navy text, teal actions, Atkinson Hyperlegible, generous targets, visible focus, and reduced-motion support. The original ClearStep stair-and-arrow mark lives in `src/components/clearstep/Brand.tsx`; its favicon is `public/favicon.svg`.

Google Fonts is optional at runtime: the interface falls back to the system sans-serif font when unavailable.
