import { readFileSync } from "node:fs";
import { describe, it, expect, vi } from "vitest";
import { createFieldHelpHandler } from "@/server/field-help";
const req = (
  body: unknown = { fieldId: "extra-withholding", mode: "explain" },
  origin = "http://localhost:3000",
) =>
  new Request("http://localhost:3000/api/field-help", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(body),
  });
const content =
  "This field concerns an additional amount withheld each pay period. Check the official instructions before choosing an amount.";

describe("form companion endpoint", () => {
  it("uses local inference with fixed evidence and caches its answer", async () => {
    const fetcher = vi
      .fn()
      .mockImplementation(async () => Response.json({ done: true, response: content }));
    const handler = createFieldHelpHandler(fetcher);
    expect(await (await handler(req())).json()).toMatchObject({
      isAI: true,
      provider: "ollama",
      model: "qwen2.5:7b",
    });
    await handler(req());
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0]![0]).toBe("http://127.0.0.1:11434/api/generate");
    const body = JSON.parse(fetcher.mock.calls[0]![1].body);
    expect(body.prompt).toContain("each pay period");
    expect(body.prompt).not.toContain("inputValue");
  });
  it("supports server-only OpenAI configuration for deployment", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      Response.json({
        status: "completed",
        output: [
          {
            type: "message",
            content: [{ type: "output_text", text: JSON.stringify({ explanation: content }) }],
          },
        ],
      }),
    );
    const handler = createFieldHelpHandler(fetcher, { provider: "openai", apiKey: "test-secret" });
    const result = await (await handler(req())).json();
    expect(result).toMatchObject({ provider: "openai", isAI: true });
    expect(JSON.stringify(result)).not.toContain("test-secret");
    expect(JSON.parse(fetcher.mock.calls[0]![1].body).store).toBe(false);
  });
  it("rejects entered values, unknown fields, and oversized payloads before inference", async () => {
    const fetcher = vi.fn();
    const handler = createFieldHelpHandler(fetcher);
    expect((await handler(req({ fieldId: "other-income", value: "private" }))).status).toBe(400);
    expect((await handler(req({ fieldId: "ssn" }))).status).toBe(400);
    expect((await handler(req({ fieldId: "x".repeat(600) }))).status).toBe(413);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("keeps correct extra-withholding wording that mentions money not added to pay", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      Response.json({
        done: true,
        response:
          "This field is extra tax taken out of each paycheck, not money added to your pay. Check the official Step 4(c) instructions.",
      }),
    );
    expect(await (await createFieldHelpHandler(fetcher)(req())).json()).toMatchObject({
      isAI: true,
      provider: "ollama",
    });
  });
  it("preserves the joint-filing condition when the model mentions a spouse", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      Response.json({
        done: true,
        response:
          "If you have more than one job or your spouse works, review Step 2 of the W-4 instructions.",
      }),
    );
    const result = await (
      await createFieldHelpHandler(fetcher)(req({ fieldId: "multiple-jobs", mode: "simpler" }))
    ).json();
    expect(result.isAI).toBe(true);
    expect(result.explanation).toMatch(/joint tax return/i);
  });
  it("rejects unrelated website origins", async () => {
    expect((await createFieldHelpHandler()(req(undefined, "https://evil.example"))).status).toBe(
      403,
    );
  });
  it("permits a local extension and requires an allowlisted ID on hosted servers", async () => {
    const id = "a".repeat(32);
    const fetcher = vi.fn().mockRejectedValue(Error());
    const handler = createFieldHelpHandler(fetcher);
    expect((await handler(req(undefined, `chrome-extension://${id}`))).status).toBe(200);
    const hosted = () =>
      new Request("https://clearstep.example/api/field-help", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: `chrome-extension://${id}` },
        body: JSON.stringify({ fieldId: "other-income" }),
      });
    expect((await handler(hosted())).status).toBe(403);
    expect((await createFieldHelpHandler(fetcher, { extensionIds: id })(hosted())).status).toBe(
      200,
    );
  });
  it.each(["offline", "bad-json", "url", "money", "incomplete"])(
    "labels fallback honestly for %s",
    async (kind) => {
      const fetcher = vi.fn();
      if (kind === "offline") fetcher.mockRejectedValue(Error());
      else
        fetcher.mockResolvedValue(
          Response.json({
            done: kind !== "incomplete",
            response:
              kind === "bad-json"
                ? "{"
                : kind === "url"
                  ? "Visit https://bad.example for an answer."
                  : kind === "money"
                    ? "You should enter $500 in this field."
                    : content,
          }),
        );
      expect(await (await createFieldHelpHandler(fetcher)(req())).json()).toMatchObject({
        isAI: false,
        source: { url: "https://www.irs.gov/pub/irs-pdf/fw4.pdf" },
      });
    },
  );
});

describe("extension field detection privacy", () => {
  const code = readFileSync("public/companion/detect.js", "utf8");
  const detect = new Function("Element", `${code}; return globalThis.clearstepFieldIdFor;`)(
    Element,
  ) as (element: Element) => string | null;
  it("matches a label without ever accessing an answer", () => {
    document.body.innerHTML = '<label for="amount">Extra withholding</label><input id="amount">';
    const input = document.getElementById("amount")!;
    Object.defineProperty(input, "value", {
      get() {
        throw Error("must not read answers");
      },
    });
    expect(detect(input)).toBe("extra-withholding");
  });
  it("ignores unknown and password fields", () => {
    document.body.innerHTML =
      '<label for="ssn">Social security number</label><input id="ssn"><label for="password">Extra withholding</label><input id="password" type="password">';
    expect(detect(document.getElementById("ssn")!)).toBeNull();
    expect(detect(document.getElementById("password")!)).toBeNull();
  });
});

it("uses Gemini with header authentication and reports model failures honestly", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(
      Response.json({
        candidates: [{ content: { parts: [{ text: JSON.stringify({ explanation: content }) }] } }],
      }),
    )
    .mockResolvedValueOnce(new Response("", { status: 404 }));
  const handler = createFieldHelpHandler(fetcher, { provider: "gemini", apiKey: "test-secret" });
  expect(await (await handler(req())).json()).toMatchObject({
    isAI: true,
    provider: "gemini",
    model: "gemini-3.5-flash-lite",
  });
  expect(fetcher.mock.calls[0]![0]).not.toContain("test-secret");
  expect(fetcher.mock.calls[0]![1].headers["x-goog-api-key"]).toBe("test-secret");
  expect(
    await (await handler(req({ fieldId: "other-income", mode: "explain" }))).json(),
  ).toMatchObject({ isAI: false, status: "model-unavailable" });
});

it.each([
  ["w9-classification", "https://www.irs.gov/pub/irs-pdf/fw9.pdf", "W-9"],
  ["ds11-signature", "https://eforms.state.gov/Forms/ds11_pdf.PDF", "DS-11"],
])("grounds %s in its own form and official source", async (fieldId, source, form) => {
  const fetcher = vi
    .fn()
    .mockResolvedValue(
      Response.json({
        done: true,
        response: "Review the official instructions for this field before completing the form.",
      }),
    );
  const handler = createFieldHelpHandler(fetcher);
  const result = await (await handler(req({ fieldId, mode: "explain" }))).json();
  expect(result).toMatchObject({ isAI: true, fieldId, source: { url: source } });
  expect(JSON.parse(fetcher.mock.calls[0]![1].body).prompt).toContain(form);
  expect(JSON.parse(fetcher.mock.calls[0]![1].body).prompt).not.toContain(
    "income without withholding",
  );
});
