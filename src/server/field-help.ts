import { z } from "zod";
import { FORM_FIELDS, FORM_SOURCE } from "@/data/form-fields";
const inputSchema = z
  .object({
    fieldId: z.enum(["multiple-jobs", "other-income", "extra-withholding"]),
    mode: z.enum(["explain", "simpler", "find"]).default("explain"),
  })
  .strict();
const outputSchema = z.object({ explanation: z.string().trim().min(20).max(1300) }).strict();

function keepJointFiling(fieldId: string, text: string) {
  if (
    fieldId !== "multiple-jobs" ||
    !/spouse/i.test(text) ||
    /jointly|joint tax return|joint fil/i.test(text)
  )
    return text;
  return `${text.trim()} This spouse situation applies only if you file a joint tax return.`;
}

export function createFieldHelpHandler(
  fetcher: typeof fetch = fetch,
  config: {
    provider?: string | undefined;
    apiKey?: string | undefined;
    model?: string | undefined;
    extensionIds?: string | undefined;
  } = {},
) {
  const provider =
    config.provider === "openai" ? "openai" : config.provider === "gemini" ? "gemini" : "ollama";
  const model =
    provider === "openai"
      ? config.model || "gpt-4o-mini"
      : provider === "gemini"
        ? config.model || "gemini-3.5-flash-lite"
        : "qwen2.5:7b";
  const extensionIds = (config.extensionIds || "").split(",").filter(Boolean);
  let windowStart = 0;
  let calls = 0;
  const cache = new Map<string, { text: string; until: number }>();
  let busy = false;
  const reply = (data: unknown, status = 200) =>
    Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
  return async (request: Request) => {
    const url = new URL(request.url);
    const origin = request.headers.get("origin");
    const extension =
      !!origin &&
      /^chrome-extension:\/\/[a-p]{32}$/.test(origin) &&
      (["localhost", "127.0.0.1"].includes(url.hostname) ||
        extensionIds.includes(origin.slice("chrome-extension://".length)));
    if (origin && origin !== url.origin && !extension)
      return reply({ error: "Origin not allowed." }, 403);
    if (request.method !== "POST") return reply({ error: "Use POST." }, 405);
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      return reply({ error: "Use JSON." }, 415);
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: "Missing field." }, 400);
    let text = "";
    let bytes = 0;
    const decoder = new TextDecoder();
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        bytes += chunk.value.byteLength;
        if (bytes > 512) {
          await reader.cancel();
          return reply({ error: "Only a field identifier is accepted." }, 413);
        }
        text += decoder.decode(chunk.value, { stream: true });
      }
      text += decoder.decode();
    } catch {
      return reply({ error: "Invalid request." }, 400);
    }
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      return reply({ error: "Invalid JSON." }, 400);
    }
    const input = inputSchema.safeParse(raw);
    if (!input.success) return reply({ error: "This field is not supported yet." }, 400);
    const { fieldId, mode } = input.data;
    const field = FORM_FIELDS[fieldId];
    const base = {
      fieldId,
      label: field.label,
      step: field.step,
      source: FORM_SOURCE,
      find: field.find,
    };
    const fallback = (reason: string) =>
      reply({ ...base, isAI: false, explanation: field.evidence, status: reason });
    const key = `${fieldId}:${mode}`;
    const cached = cache.get(key);
    if (cached && cached.until > Date.now())
      return reply({
        ...base,
        isAI: true,
        explanation: cached.text,
        status: "cached",
        model,
        provider,
      });
    if (busy) return fallback("busy");
    if (Date.now() - windowStart > 60000) {
      windowStart = Date.now();
      calls = 0;
    }
    if (calls >= 20) return fallback("busy");
    if (provider !== "ollama" && !config.apiKey) return fallback("offline");
    calls++;
    busy = true;
    try {
      const system =
        "You explain W-4 labels to a first-time reader. Use only the supplied evidence. Explain, never fill in the form or choose a tax amount. Do not infer personal circumstances, eligibility, or recommend checking a box. Preserve all conditions in the evidence. Do not import facts from other fields. No made-up examples, amounts, deadlines, links, or additional tax facts. Return JSON with one explanation string, 2-3 brief sentences, no Markdown. If unsure, direct the reader to the official instructions.";
      const prompt = JSON.stringify({
        criticalRule:
          fieldId === "multiple-jobs"
            ? "If you mention a spouse, also say married filing jointly. More than one job means jobs held at the same time."
            : fieldId === "extra-withholding"
              ? "Say extra tax is taken out of each paycheck. You may clarify that it is not extra money added to pay."
              : "This covers income without withholding, not job or self-employment income.",
        field: field.label,
        evidence: field.evidence,
        find: field.find,
        task:
          mode === "simpler"
            ? "Use very simple everyday words, at most 45 words."
            : mode === "find"
              ? "Explain where to check the information, at most 65 words."
              : "Explain what this field means, at most 65 words.",
      });
      const format = {
        type: "object",
        properties: { explanation: { type: "string" } },
        required: ["explanation"],
        additionalProperties: false,
      };
      const response = await fetcher(
        provider === "openai"
          ? "https://api.openai.com/v1/responses"
          : provider === "gemini"
            ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
            : "http://127.0.0.1:11434/api/generate",
        {
          method: "POST",
          headers:
            provider === "openai"
              ? { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` }
              : provider === "gemini"
                ? { "Content-Type": "application/json", "x-goog-api-key": config.apiKey || "" }
                : { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(60000),
          body: JSON.stringify(
            provider === "openai"
              ? {
                  model,
                  store: false,
                  max_output_tokens: 400,
                  instructions: system,
                  input: prompt,
                  text: {
                    format: {
                      type: "json_schema",
                      name: "field_explanation",
                      strict: true,
                      schema: format,
                    },
                  },
                }
              : provider === "gemini"
                ? {
                    contents: [
                      {
                        parts: [
                          {
                            text:
                              system +
                              "\n\nContext: " +
                              prompt +
                              "\n\nReturn JSON matching this schema: " +
                              JSON.stringify(format),
                          },
                        ],
                      },
                    ],
                    generationConfig: {
                      temperature: 0,
                      maxOutputTokens: 1500,
                      responseMimeType: "application/json",
                    },
                  }
                : {
                    model,
                    stream: false,
                    keep_alive: "30m",
                    options: { temperature: 0, seed: 7, num_predict: 220, num_ctx: 2048 },
                    system: system.replace(
                      "Return JSON with one explanation string, 2-3 brief sentences, no Markdown.",
                      "Return only 2-3 brief plain-English sentences, no JSON or Markdown.",
                    ),
                    prompt,
                  },
          ),
        },
      );
      if (!response.ok)
        return fallback(
          response.status === 429
            ? "rate-limited"
            : response.status === 404
              ? "model-unavailable"
              : response.status === 401 || response.status === 403
                ? "configuration"
                : "offline",
        );
      const data = await response.json();
      let generated: string;
      if (provider === "openai") {
        if (data.status !== "completed" || !Array.isArray(data.output))
          return fallback("unavailable");
        generated = data.output
          .filter((entry: { type: string }) => entry.type === "message")
          .flatMap((entry: { content: { type: string; text?: string }[] }) => entry.content)
          .filter((part: { type: string }) => part.type === "output_text")
          .map((part: { text: string }) => part.text)
          .join("");
      } else if (provider === "gemini") {
        if (!Array.isArray(data.candidates) || !data.candidates[0]?.content?.parts?.[0]?.text)
          return fallback("unavailable");
        generated = data.candidates[0].content.parts[0].text;
      } else {
        if (!data.done || typeof data.response !== "string") return fallback("unavailable");
        generated = JSON.stringify({ explanation: data.response.trim() });
      }
      let parsed;
      try {
        parsed = outputSchema.safeParse(JSON.parse(generated));
      } catch {
        return fallback("unavailable");
      }
      if (!parsed.success) return fallback("unavailable");
      const explanation = keepJointFiling(fieldId, parsed.data.explanation);
      const wording = explanation.toLowerCase();
      if (/https?:|www\.|\$\s*\d/.test(explanation)) return fallback("unavailable");
      if (fieldId === "extra-withholding") {
        const claimsAddsPay =
          /added to (your )?pay|increase(s)? (your )?pay/.test(wording) &&
          !/not .{0,50}(added to (your )?pay|increase)/.test(wording) &&
          !/not (extra |additional )?money added/.test(wording);
        if (
          claimsAddsPay ||
          /not related to multiple jobs/.test(wording) ||
          (mode !== "find" && !/paycheck|pay period/.test(wording))
        )
          return fallback("unavailable");
      }
      cache.set(key, { text: explanation, until: Date.now() + 3600000 });
      return reply({
        ...base,
        isAI: true,
        explanation,
        status: "generated",
        model,
        provider,
      });
    } catch {
      return fallback("offline");
    } finally {
      busy = false;
    }
  };
}
export const handleFieldHelp = createFieldHelpHandler(fetch, {
  provider: process.env["AI_PROVIDER"],
  apiKey:
    process.env[process.env["AI_PROVIDER"] === "gemini" ? "GEMINI_API_KEY" : "OPENAI_API_KEY"],
  model: process.env[process.env["AI_PROVIDER"] === "gemini" ? "GEMINI_MODEL" : "OPENAI_MODEL"],
  extensionIds: process.env["CLEARSTEP_EXTENSION_IDS"],
});
