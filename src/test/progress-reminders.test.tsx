import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlanProvider, initialPlan, usePlan } from "@/lib/plan-store";
import {
  clearPlan,
  normalizePlan,
  readPlan,
  writePlan,
  PLAN_STORAGE_KEY,
} from "@/lib/plan-persistence";
import { buildReminderIcs, downloadIcs, isReminderDate } from "@/lib/calendar";
import { getNextStep, prepDone } from "@/lib/plan-logic";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const personal = () => ({
  ...initialPlan(),
  intakeComplete: true,
  answers: { help: "person" as const, firstTime: "yes" as const },
  stagesDone: { start: true, provider: false },
  reminderDate: "2028-02-29",
});

describe("safe version-1 persistence", () => {
  it("restores a valid plan and drops arbitrary fields and illegal skips", () => {
    const plan = personal();
    const unsafe = {
      ...plan,
      name: "do not retain",
      checklist: { "photo-id": "skipped", "income-forms": "help", secret: "do not retain" },
      answers: { ...plan.answers, ssn: "do not retain" },
    };
    const result = normalizePlan(unsafe)!;
    expect(result.checklist["photo-id"]).toBe("todo");
    expect(result.checklist["efile-identity"]).toBe("todo");
    expect(getNextStep(result)).toMatchObject({ itemId: "income-forms", needsHelp: true });
    expect(prepDone(result)).toBe(false);
    writePlan(localStorage, unsafe);
    expect(localStorage.getItem(PLAN_STORAGE_KEY)).not.toContain("do not retain");
    expect(readPlan(localStorage)).toEqual(result);
  });
  it.each([null, [], { version: 2 }, { version: 1, isSample: true }])(
    "rejects unsupported records %j",
    (value) => {
      expect(normalizePlan(value)).toBeNull();
    },
  );
  it("normalizes malformed fields and handles corrupt or blocked storage", () => {
    const result = normalizePlan({
      version: 1,
      intakeComplete: true,
      answers: { help: "invalid" },
      stagesDone: { start: "true" },
      reminderDate: "2026-02-30",
    })!;
    expect(result.intakeComplete).toBe(false);
    expect(result.stagesDone.start).toBe(false);
    expect(result.reminderDate).toBeNull();
    localStorage.setItem(PLAN_STORAGE_KEY, "{");
    expect(readPlan(localStorage)).toBeNull();
    const blocked = {
      getItem() {
        throw Error();
      },
      setItem() {
        throw Error();
      },
      removeItem() {
        throw Error();
      },
    };
    expect(readPlan(blocked)).toBeNull();
    expect(writePlan(blocked, personal())).toBe(false);
    expect(clearPlan(blocked)).toBe(false);
  });
  it("remounts with the unfinished help item, reminder and current stage", async () => {
    const first = renderHook(usePlan, { wrapper: PlanProvider });
    await waitFor(() => expect(first.result.current.hydrated).toBe(true));
    act(() =>
      first.result.current.update(() => ({
        ...personal(),
        checklist: { ...initialPlan().checklist, "income-forms": "help" },
      })),
    );
    first.unmount();
    const resumed = renderHook(usePlan, { wrapper: PlanProvider });
    await waitFor(() => expect(resumed.result.current.welcomeBack).toBe(true));
    expect(resumed.result.current.plan.reminderDate).toBe("2028-02-29");
    expect(getNextStep(resumed.result.current.plan)).toMatchObject({
      stage: 2,
      itemId: "income-forms",
      needsHelp: true,
    });
  });
  it("refreshing a modified sample restores personal progress; reset clears it", async () => {
    writePlan(localStorage, personal());
    const first = renderHook(usePlan, { wrapper: PlanProvider });
    await waitFor(() => expect(first.result.current.hydrated).toBe(true));
    act(() => first.result.current.loadSample());
    act(() => first.result.current.update((p) => ({ ...p, reminderDate: "2030-01-01" })));
    act(() => first.result.current.loadSample());
    expect(first.result.current.plan.reminderDate).toBeNull();
    first.unmount();
    const resumed = renderHook(usePlan, { wrapper: PlanProvider });
    await waitFor(() => expect(resumed.result.current.hydrated).toBe(true));
    expect(resumed.result.current.plan).toEqual(personal());
    act(() => resumed.result.current.reset());
    resumed.unmount();
    const reset = renderHook(usePlan, { wrapper: PlanProvider });
    await waitFor(() => expect(reset.result.current.hydrated).toBe(true));
    expect(reset.result.current.plan).toEqual(initialPlan());
  });
});

describe("personal all-day calendar export", () => {
  it.each([
    ["2028-02-29", "20280301"],
    ["2026-12-31", "20270101"],
    ["2026-03-08", "20260309"],
    ["2026-11-01", "20261102"],
    ["0099-12-31", "01000101"],
  ])("preserves %s and uses an exclusive next-day end", (date, end) => {
    const ics = buildReminderIcs(
      date,
      "Your reminder",
      "Personal reminder, not a government deadline.",
    );
    expect(ics).toContain(`DTSTART;VALUE=DATE:${date.replace(/-/g, "")}`);
    expect(ics).toContain(`DTEND;VALUE=DATE:${end}`);
    expect(ics).toMatch(/DTSTAMP:\d{8}T\d{6}Z/);
    expect(ics).not.toContain("VALARM");
  });
  it.each(["2026-02-29", "2026-04-31", "2026-13-01", "2026-1-01", "", "0000-01-01", "9999-12-31"])(
    "rejects invalid or unrepresentable date %s",
    (date) => {
      expect(isReminderDate(date)).toBe(false);
      expect(() => buildReminderIcs(date, "Reminder", "")).toThrow(RangeError);
    },
  );
  it("escapes text and folds long Unicode lines without splitting characters", () => {
    const title = "Reminder; one,two\\three\r\nInjected: no " + "🌱".repeat(50);
    const ics = buildReminderIcs("2026-10-20", title, "Personal");
    for (const line of ics.split("\r\n"))
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    const unfolded = ics.replace(/\r\n /g, "");
    expect(unfolded).toContain("SUMMARY:Reminder\\; one\\,two\\\\three\\nInjected: no ");
    expect(unfolded).toContain("🌱".repeat(50));
  });
  it("downloads a calendar Blob and releases its object URL", () => {
    const create = vi.fn((_blob: Blob) => "blob:reminder");
    const revoke = vi.fn();
    vi.stubGlobal("URL", { createObjectURL: create, revokeObjectURL: revoke });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      expect(this.download).toBe("clearstep-reminder.ics");
      expect(this.href).toBe("blob:reminder");
    });
    vi.useFakeTimers();
    try {
      downloadIcs(
        "clearstep-reminder.ics",
        buildReminderIcs("2026-10-20", "Your reminder", "Personal"),
      );
      expect(click).toHaveBeenCalledOnce();
      expect(create.mock.calls[0]?.[0]).toBeInstanceOf(Blob);
      expect(document.querySelector("a[download]")).toBeNull();
      vi.runAllTimers();
      expect(revoke).toHaveBeenCalledWith("blob:reminder");
    } finally {
      vi.useRealTimers();
    }
  });
});
