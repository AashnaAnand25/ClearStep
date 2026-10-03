import { describe, expect, it } from "vitest";
import { SOURCES, SOURCE_REVIEW_DATE, findSource, getSource } from "@/data/sources";
import { ALL_CHECKLIST_ITEMS, getChecklist } from "@/data/checklist";
import { getJourneyRouting, type IntakeAnswers } from "@/data/routing";
import { getExplanationContext } from "@/data/explanation-context";
import { getVerifiedDeadlines } from "@/data/dates";
import { getExplanation } from "@/lib/explanations";
import { initialPlan } from "@/lib/plan-store";
import { getNextStep, prepDone } from "@/lib/plan-logic";

const variants: IntakeAnswers[] = ["person", "online", "unsure"].flatMap((help) =>
  ["yes", "no", "unsure"].map((firstTime) => ({ help, firstTime }) as IntakeAnswers),
);

describe("Reviewed content and preference routing", () => {
  it("only exposes the curated HTTPS IRS sources with dated section evidence", () => {
    for (const [id, source] of Object.entries(SOURCES)) {
      const url = new URL(source.url);
      expect(source.id).toBe(id);
      expect(url.protocol).toBe("https:");
      expect(url.hostname).toBe("www.irs.gov");
      expect(url.username + url.password + url.search).toBe("");
      expect(source.reviewedAt).toBe(SOURCE_REVIEW_DATE);
      expect(source.reviewMethod).toBe("assistant-source-review");
      expect(source.evidence.length).toBeGreaterThan(0);
    }
    expect(findSource("constructor")).toBeUndefined();
    expect(findSource("__proto__")).toBeUndefined();
    expect(findSource("https://irs.gov.example.com")).toBeUndefined();
    expect(() => getSource("not-reviewed")).toThrow("Unknown official source");
  });

  it.each(variants)(
    "resolves a complete reviewed context for $help / $firstTime",
    async (answers) => {
      const route = getJourneyRouting(answers);
      const items = getChecklist(answers);
      expect(getSource(route.sourceId)).toBeDefined();
      expect(getSource(route.checklistSourceId)).toBeDefined();
      expect(route.sourceId).toBe(answers.help === "online" ? "irs-free-file" : "irs-free-prep");
      expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
      for (const item of items) {
        expect(ALL_CHECKLIST_ITEMS.some((record) => record.id === item.id)).toBe(true);
        expect(getSource(item.sourceId)).toBeDefined();
        expect(getSource(item.helpAction.sourceId)).toBeDefined();
        if (item.optional) expect(item.condition).toBeTruthy();
        const context = getExplanationContext(item.id, answers)!;
        const answer = await getExplanation(item.id, answers);
        expect(answer?.sourceIds).toEqual(context.sources.map((source) => source.id));
        expect(answer?.isSample).toBe(true);
      }
    },
  );

  it("does not require an appointment photo ID on the online route", () => {
    const answers: IntakeAnswers = { help: "online", firstTime: "yes" };
    const items = getChecklist(answers);
    expect(items.map((item) => item.id)).toEqual([
      "efile-identity",
      "income-forms",
      "efile-signature",
      "bank-info",
    ]);
    expect(items.find((item) => item.id === "efile-signature")?.why).toContain("first-time-filer");
    expect(getExplanationContext("photo-id", answers)).toBeNull();
    expect(getExplanationContext("unknown", answers)).toBeNull();
  });

  it("keeps first-time filing from turning into an eligibility decision", () => {
    for (const help of ["online", "person", "unsure"] as const) {
      expect(getJourneyRouting({ help, firstTime: "yes" })).toEqual(
        getJourneyRouting({ help, firstTime: "no" }),
      );
    }
  });

  it("uses only the active checklist for progress, including saved plans missing new IDs", () => {
    const plan = initialPlan();
    plan.answers = { help: "online", firstTime: "yes" };
    plan.stagesDone.start = true;
    // Emulate an older saved state: missing online keys must never count as done.
    delete plan.checklist["efile-identity"];
    delete plan.checklist["efile-signature"];
    plan.checklist["photo-id"] = "help";
    expect(getNextStep(plan)).toMatchObject({ itemId: "efile-identity" });
    expect(prepDone(plan)).toBe(false);
    for (const item of getChecklist(plan.answers))
      plan.checklist[item.id] = item.optional ? "skipped" : "ready";
    expect(prepDone(plan)).toBe(true);
    expect(getNextStep(plan).kind).toBe("provider");
    plan.checklist["efile-identity"] = "skipped";
    expect(prepDone(plan)).toBe(false);
    expect(getNextStep(plan)).toMatchObject({ itemId: "efile-identity" });
  });

  it("does not invent deadlines from incomplete intake", async () => {
    expect(await getVerifiedDeadlines()).toEqual([]);
  });
});
