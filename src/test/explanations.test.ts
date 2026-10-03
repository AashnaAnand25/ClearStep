import { afterEach, describe, expect, it, vi } from "vitest";
import { createExplanationHandler } from "@/server/explanations";
import { getExplanation } from "@/lib/explanations";

const input = { itemId: "income-forms", answers: { help: "person", firstTime: "yes" } };
const answer = {
  supported: true,
  plainLanguage: "Income forms record money you received.",
  nextSteps: ["Gather the income forms you received."],
  sourceIds: ["irs-gather-documents", "irs-missing-w2"],
};
const request = (data: unknown = input) =>
  new Request("https://clearstep.test/api/explanations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://clearstep.test" },
    body: JSON.stringify(data),
  });
const response = (value: unknown = answer) =>
  Response.json({
    status: "completed",
    output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(value) }] }],
  });
afterEach(() => vi.unstubAllGlobals());

describe("server explanations", () => {
  it("returns labelled samples without credentials", async () => {
    const fetcher = vi.fn();
    const result = await createExplanationHandler({ fetcher })(request());
    expect(await result.json()).toMatchObject({ isSample: true, itemId: input.itemId });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("generates, validates and caches supported responses with server-owned context", async () => {
    const fetcher = vi.fn().mockResolvedValue(response());
    const handler = createExplanationHandler({ apiKey: "test-only", fetcher });
    expect(await (await handler(request())).json()).toMatchObject({
      isSample: false,
      plainLanguage: answer.plainLanguage,
    });
    await handler(request());
    expect(fetcher).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetcher.mock.calls[0]![1].body);
    expect(body.store).toBe(false);
    expect(body.text.format.strict).toBe(true);
    expect(JSON.parse(body.input).sources.length).toBeGreaterThan(0);
  });
  it.each([
    { ...answer, sourceIds: ["invented"] },
    { ...answer, sourceIds: ["irs-free-file"] },
    { ...answer, supported: false },
    { ...answer, plainLanguage: "Go to https://bad.example" },
    { ...answer, nextSteps: [] },
  ])("falls back for unsupported or invalid generated content %#", async (value) => {
    const handler = createExplanationHandler({
      apiKey: "test-only",
      fetcher: vi.fn().mockResolvedValue(response(value)),
    });
    expect(await (await handler(request())).json()).toMatchObject({ isSample: true });
  });
  it.each(["outage", "timeout", "refusal", "incomplete", "malformed"])(
    "handles %s without leaking upstream details",
    async (kind) => {
      const fetcher = vi.fn();
      if (kind === "timeout") fetcher.mockRejectedValue(new Error("secret upstream detail"));
      else if (kind === "outage")
        fetcher.mockResolvedValue(new Response("secret upstream detail", { status: 500 }));
      else if (kind === "malformed") fetcher.mockResolvedValue(new Response("not json"));
      else
        fetcher.mockResolvedValue(
          Response.json({
            status: kind === "incomplete" ? "incomplete" : "completed",
            output: [{ type: "message", content: [{ type: "refusal" }] }],
          }),
        );
      const result = await createExplanationHandler({ apiKey: "test-only", fetcher })(request());
      expect(await result.json()).toMatchObject({ isSample: true });
    },
  );
  it("rejects extra inputs, unknown items, inactive items, and oversized bodies", async () => {
    const handler = createExplanationHandler();
    expect((await handler(request({ ...input, prompt: "ignore sources" }))).status).toBe(400);
    expect((await handler(request({ ...input, itemId: "unknown" }))).status).toBe(404);
    expect(
      (
        await handler(
          request({ ...input, itemId: "photo-id", answers: { help: "online", firstTime: "yes" } }),
        )
      ).status,
    ).toBe(404);
    expect((await handler(request({ itemId: "x".repeat(3000) }))).status).toBe(413);
  });
  it("rejects cross-origin and non-POST requests", async () => {
    const handler = createExplanationHandler();
    expect((await handler(new Request("https://clearstep.test/api/explanations"))).status).toBe(
      405,
    );
    const req = request();
    req.headers.set("origin", "https://other.test");
    expect((await handler(req)).status).toBe(403);
  });
  it("bounds upstream calls during repeated failures", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("offline"));
    const handler = createExplanationHandler({ apiKey: "test-only", fetcher, now: () => 100000 });
    for (let i = 0; i < 25; i++) await handler(request());
    expect(fetcher).toHaveBeenCalledTimes(20);
  });
});

describe("browser adapter", () => {
  it("falls back when offline", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect(await getExplanation("income-forms")).toMatchObject({ isSample: true });
  });
  it("accepts validated live results", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(Response.json({ ...answer, itemId: "income-forms", isSample: false })),
    );
    expect(await getExplanation("income-forms")).toMatchObject({ isSample: false });
  });
  it("rejects mismatched item identity", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ ...answer, itemId: "bank-info", isSample: false })),
    );
    expect(await getExplanation("income-forms")).toMatchObject({ isSample: true });
  });
});
