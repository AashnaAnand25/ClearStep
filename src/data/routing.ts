import type { PlanState } from "@/lib/plan-store";

export type IntakeAnswers = PlanState["answers"];
export type JourneyKind = "assisted" | "online";
export interface JourneyRouting {
  kind: JourneyKind;
  sourceId: string;
  checklistSourceId: string;
  why: string;
  beforeYouContinue: string;
  checklistIntro: string;
}

/** Preferences choose a starting point, never eligibility or a tax obligation. */
export function getJourneyRouting(answers: IntakeAnswers): JourneyRouting {
  if (answers.help === "online") {
    return {
      kind: "online",
      sourceId: "irs-free-file",
      checklistSourceId: "irs-gather-documents",
      why: "You chose an online option. Explore IRS Free File's guided software and check a provider's requirements before choosing it.",
      beforeYouContinue:
        "Start through IRS.gov to reach the Free File offer. State filing may cost extra. Free File does not handle prior-year returns; check which tax year the service supports.",
      checklistIntro:
        "A starter list for online filing. Check the full IRS document guide and your provider's requirements for your situation.",
    };
  }
  return {
    kind: "assisted",
    sourceId: "irs-free-prep",
    checklistSourceId: "irs-checklist",
    why:
      answers.help === "person"
        ? "You'd like someone to help. Explore the IRS volunteer preparation programs and find out whether a nearby site can help with your return."
        : "Not sure where to start? Explore the IRS volunteer preparation programs to see what human help is available.",
    beforeYouContinue:
      "Confirm the site's availability, services and requirements before visiting. TCE particularly serves adults aged 60 and older. Choosing this option does not confirm eligibility or book an appointment.",
    checklistIntro:
      "A starter list for a tax-help appointment. Review the full IRS checklist and ask the site what applies to you.",
  };
}
