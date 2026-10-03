# ClearStep deployment

Vercel uses the TanStack Start framework in vercel.json. Keep framework build/output defaults; do not override the output directory.

Set these server-only variables for Production (and Preview if desired):

- AI_PROVIDER=gemini
- GEMINI_API_KEY=your Google AI Studio key
- GEMINI_MODEL=gemini-3.5-flash-lite

The model above successfully generated explanations with this project's key on October 3, 2026. The previous gemini-2.0-flash-exp returned 404. Availability and free-tier quotas depend on Google's project and model settings; listing a model does not guarantee generation access.

Redeploy after changing environment variables. A local .env does not configure Vercel. Never prefix a secret with VITE_.

For OpenAI, set AI_PROVIDER=openai, OPENAI_API_KEY, and OPENAI_MODEL. For local Ollama, use AI_PROVIDER=ollama and follow docs/FORM_COMPANION.md. Ollama on your laptop is not available inside a Vercel function.

Verify /form-lab.html: focus each supported field, select Even simpler, and check that the badge says AI EXPLANATION · GEMINI. Reviewed fallback text is not an AI success. The field API reports model-unavailable for upstream 404, configuration for 401/403, rate-limited for 429, and offline for other connection failures.

Listen uses the browser's speech service when available. Only explanation text is spoken; form answers are never sent to the AI endpoint. Voice availability depends on browser/OS settings.

For the extension, add its exact ID to CLEARSTEP_EXTENSION_IDS and configure its backend to the deployed HTTPS origin. See docs/FORM_COMPANION.md.

The process-local cache and request budget are demo protections, not a global production quota. Before a larger public launch, add shared rate limiting and usage monitoring.
