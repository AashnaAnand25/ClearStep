# ClearStep

Government paperwork, one clear next step.

An accessible tax-help preparation prototype for people with low confidence using government websites. The frontend includes a two-question intake, official-resource cards, contextual explanations, a starter checklist, personal calendar reminders, and browser-local progress.

## Run locally

Requires Node.js 22.12+ and Bun 1.3+ (the committed lockfile is `bun.lock`).

```sh
bun install --frozen-lockfile
bun run dev
```

Open http://127.0.0.1:3000. The app works without a key using clearly labelled sample explanations. For live AI, copy `.env.example` to `.env`, set `OPENAI_API_KEY` to a funded API key, and restart the server. Never use a `VITE_` prefix for secrets.

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
- Live explanations use a server-only OpenAI Responses API endpoint with reviewed IRS context and validated citations. Missing credentials, service outages, unsupported responses, and invalid citations fall back to labelled samples.
- Six official IRS pages were reviewed by the assistant on October 3, 2026; provenance and limitations are in [docs/SOURCE_REVIEW.md](docs/SOURCE_REVIEW.md).
- Appointment and online choices have distinct source-backed starter checklists.
- No official deadline is supplied. Calendar exports are personal reminders.
- Checklist completion means preparation, never submission or tax filing.
- Progress is stored only in this browser. Sample mode does not overwrite a personal plan and is intentionally not persisted across reloads.
- Optional items can be marked as not applicable. Provider-specific requirements still need review.

See [TEAM_HANDOFF.md](TEAM_HANDOFF.md) for exact files, interfaces, and implementation details and final submission tasks.

## Design

Warm neutral surfaces, navy text, teal actions, Atkinson Hyperlegible, generous targets, visible focus, and reduced-motion support. The original ClearStep stair-and-arrow mark lives in `src/components/clearstep/Brand.tsx`; its favicon is `public/favicon.svg`.

Google Fonts is optional at runtime: the interface falls back to the system sans-serif font when unavailable.

## AI service and deployment

`POST /api/explanations` accepts only a checklist item ID and the two enumerated preferences. The server resolves evidence itself; it accepts no tax records, free-form prompts or client-supplied sources. Requests use structured output and `store: false`. Responses have a 12-second upstream timeout, bounded schema/citations, a one-hour process cache, and a 20-call/minute process budget. These controls do not prove factual correctness; users must check official sources. A public multi-instance deployment should add shared rate limiting and monitoring.

Keep `OPENAI_API_KEY` and optional `OPENAI_MODEL` in the hosting service's server environment. Deploy the Node server, not just the static assets. For local production with `.env`, use `bun --env-file=.env run start` after `bun run build`. The API key is never sent to the browser. The default model is `gpt-4o-mini`.

See [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) for verified readiness and [docs/LITTLEBIRD.md](docs/LITTLEBIRD.md) for actual sponsor-tool use. Littlebird is a development aid, not an embedded feature.

The response format follows [OpenAI structured-output documentation](https://developers.openai.com/api/docs/guides/structured-outputs).
