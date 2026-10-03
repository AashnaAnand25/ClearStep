import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CalendarPlus, CheckCircle2, Circle, CircleDot, ExternalLink, Info, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePlan } from "@/lib/plan-store";
import { completedStages, getNextStep, prepDone, startingSourceId } from "@/lib/plan-logic";
import { CHECKLIST, type ChecklistItemRecord } from "@/data/checklist";
import { getSource } from "@/data/sources";
import { getVerifiedDeadlines, type OfficialDeadline } from "@/data/dates";
import { buildReminderIcs, downloadIcs } from "@/lib/calendar";
import { ResourceCard } from "@/components/clearstep/ResourceCard";
import { ChecklistItem } from "@/components/clearstep/ChecklistItem";
import { ExplainPanel } from "@/components/clearstep/ExplainPanel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "My plan: Get ready for tax help — ClearStep" },
      { name: "description", content: "Your next step, official starting points, and a starter preparation checklist." },
      { property: "og:title", content: "My plan — ClearStep" },
      { property: "og:description", content: "Your next step and a starter checklist for getting tax help." },
    ],
  }),
  component: PlanPage,
});

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ block: "center" });
  const focusable = el.querySelector<HTMLElement>("button, a");
  focusable?.focus({ preventScroll: true });
}

function PlanPage() {
  const { plan, hydrated, welcomeBack, dismissWelcome, update, reset } = usePlan();
  const navigate = useNavigate();
  const [explainItem, setExplainItem] = useState<ChecklistItemRecord | null>(null);
  const [deadlines, setDeadlines] = useState<OfficialDeadline[] | null>(null);

  useEffect(() => {
    getVerifiedDeadlines().then(setDeadlines);
  }, []);

  if (!hydrated) {
    return <p className="text-lg text-muted-foreground" role="status">Loading your plan…</p>;
  }

  if (!plan.intakeComplete) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold">You don't have a plan yet</h1>
        <p className="mt-4 text-lg text-muted-foreground">Answer two short questions and we'll set out your next step.</p>
        <Button size="lg" className="mt-8" asChild>
          <Link to="/intake">Get started</Link>
        </Button>
      </div>
    );
  }

  const next = getNextStep(plan);
  const done = completedStages(plan);
  const start = getSource(startingSourceId(plan.answers.help));
  const firstTime = plan.answers.firstTime === "yes";
  const whyStart =
    plan.answers.help === "online"
      ? "You said an online option would help. Free File is an IRS program offering free online software to people who meet its requirements. It's an option to explore."
      : plan.answers.help === "person"
        ? "You said you'd like someone to help. This IRS page describes free, in-person preparation by trained volunteers for people who qualify. It's an option to explore."
        : "Not sure yet? This IRS page describes free help from trained volunteers, and is a good place to look around first. It's an option to explore.";

  const setStatus = (id: string, s: "todo" | "ready" | "help") =>
    update((p) => ({ ...p, checklist: { ...p.checklist, [id]: s } }));

  const stages = [
    { n: 1, title: "Find your official starting point", done: plan.stagesDone.start },
    { n: 2, title: "Prepare what you need", done: prepDone(plan) },
    { n: 3, title: "Continue with the provider", done: plan.stagesDone.provider },
  ];

  const nextItem = next.kind === "item" ? CHECKLIST.find((i) => i.id === next.itemId)! : null;

  return (
    <div>
      {plan.isSample && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-attention bg-attention-soft p-4">
          <p className="font-bold text-foreground">
            <Info className="mr-2 inline size-5 align-[-3px] text-attention" aria-hidden />
            Sample plan — a fictional demo with example progress.
          </p>
          <Button variant="outline" onClick={() => { reset(); navigate({ to: "/" }); }}>
            Leave sample
          </Button>
        </div>
      )}
      {welcomeBack && (
        <div role="status" className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-primary-soft p-4">
          <p className="font-bold">Welcome back. Here's where you left off.</p>
          <Button variant="ghost" onClick={dismissWelcome}>Dismiss</Button>
        </div>
      )}

      <h1 className="text-4xl font-bold sm:text-5xl">Get ready for tax help</h1>

      {/* Next step */}
      <section
        aria-labelledby="next-title"
        className="mt-10 rounded-xl border-2 border-primary bg-card p-7 shadow-focus-card sm:p-10"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="next-title" className="text-sm font-bold uppercase tracking-wider text-primary">
            Your next step
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5" aria-hidden>
              {stages.map((s) => (
                <span key={s.n} className={cn("h-2 w-8 rounded-full", s.done ? "bg-primary" : s.n === next.stage && next.kind !== "complete" ? "bg-primary/40" : "bg-border-strong")} />
              ))}
            </div>
            <p className="text-base font-bold text-muted-foreground">{done} of 3 stages done</p>
          </div>
        </div>

        {next.kind === "start" && (
          <>
            <p className="mt-4 text-2xl font-bold sm:text-3xl">Look at the official starting point on IRS.gov</p>
            <p className="mt-3 text-lg text-muted-foreground">
              Open the page, read what it offers, then come back and mark this step done. Opening it doesn't complete anything.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <a href={start.url} target="_blank" rel="noopener noreferrer">
                  Open IRS.gov <ExternalLink aria-hidden /><span className="sr-only">(opens in a new tab)</span>
                </a>
              </Button>
              <Button size="lg" variant="outline" onClick={() => update((p) => ({ ...p, stagesDone: { ...p.stagesDone, start: true } }))}>
                <CheckCircle2 aria-hidden /> I've completed this step
              </Button>
            </div>
          </>
        )}
        {next.kind === "item" && nextItem && (
          <>
            <p className="mt-4 text-2xl font-bold sm:text-3xl">
              {next.needsHelp ? `Get help with: ${nextItem.label}` : `Gather: ${nextItem.label}`}
            </p>
            <p className="mt-3 text-lg text-muted-foreground">{nextItem.why}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              {next.needsHelp ? (
                <Button size="lg" onClick={() => setExplainItem(nextItem)}>Explain this</Button>
              ) : (
                <Button size="lg" onClick={() => scrollToId(`item-${nextItem.id}`)}>Go to this item</Button>
              )}
            </div>
          </>
        )}
        {next.kind === "provider" && (
          <>
            <p className="mt-4 text-2xl font-bold sm:text-3xl">Continue with the provider</p>
            <p className="mt-3 text-lg text-muted-foreground">
              You've gathered your starter items. Use the official site to choose a provider and continue there. Come back and mark this done when you have.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <a href={start.url} target="_blank" rel="noopener noreferrer">
                  Open IRS.gov <ExternalLink aria-hidden /><span className="sr-only">(opens in a new tab)</span>
                </a>
              </Button>
              <Button size="lg" variant="outline" onClick={() => update((p) => ({ ...p, stagesDone: { ...p.stagesDone, provider: true } }))}>
                <CheckCircle2 aria-hidden /> I've completed this step
              </Button>
            </div>
          </>
        )}
        {next.kind === "complete" && (
          <>
            <p className="mt-4 flex items-center gap-3 text-2xl font-bold text-success sm:text-3xl">
              <CheckCircle2 className="size-8" aria-hidden /> Preparation complete
            </p>
            <p className="mt-3 text-lg text-muted-foreground">
              You've finished the preparation steps in this plan. Keep following your provider's instructions.
            </p>
          </>
        )}
      </section>

      {/* Stages */}
      <ol className="mt-14 space-y-12">
        <Stage n={1} title={stages[0].title} done={stages[0].done} current={next.stage === 1}>
          <ResourceCard source={start} why={whyStart} />
          {stages[0].done && (
            <UndoButton label="Mark step 1 as not done" onClick={() => update((p) => ({ ...p, stagesDone: { ...p.stagesDone, start: false } }))} />
          )}
        </Stage>

        <Stage n={2} title={stages[1].title} done={stages[1].done} current={next.stage === 2}>
          <p className="text-muted-foreground">
            This is a starter list to help you prepare, not a complete list for your situation.
            {firstTime && " Since this may be your first time filing, it's fine if you don't have last year's return."}
          </p>
          <ul className="mt-4 space-y-3">
            {CHECKLIST.map((item) => (
              <ChecklistItem
                key={item.id}
                item={item}
                status={plan.checklist[item.id]}
                isNext={next.kind === "item" && next.itemId === item.id}
                onStatus={(s) => setStatus(item.id, s)}
                onExplain={() => setExplainItem(item)}
              />
            ))}
          </ul>
          <div className="mt-4">
            <ResourceCard
              source={getSource("irs-checklist")}
              why="The IRS list of what to bring to free tax preparation. Our starter list is based on it."
            />
          </div>
        </Stage>

        <Stage n={3} title={stages[2].title} done={stages[2].done} current={next.stage === 3 && next.kind !== "complete"}>
          <p>When you've prepared, continue on the official site with the provider you choose. ClearStep doesn't file anything for you.</p>
          {stages[2].done && (
            <UndoButton label="Mark step 3 as not done" onClick={() => update((p) => ({ ...p, stagesDone: { ...p.stagesDone, provider: false } }))} />
          )}
        </Stage>
      </ol>

      {/* Reminder */}
      <section aria-labelledby="reminder-title" className="mt-16 rounded-xl border bg-card p-7">
        <h2 id="reminder-title" className="text-2xl font-bold">Your reminder</h2>
        <p className="mt-2 text-muted-foreground">Pick a date to come back to this plan. This is your own reminder, not an official date.</p>
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="reminder" className="block font-bold">Reminder date</label>
            <input
              id="reminder"
              type="date"
              value={plan.reminderDate ?? ""}
              onChange={(e) => update((p) => ({ ...p, reminderDate: e.target.value || null }))}
              className="mt-1 min-h-12 rounded-md border border-input bg-card px-3 text-base text-foreground"
            />
          </div>
          <Button
            variant="outline"
            disabled={!plan.reminderDate}
            onClick={() =>
              plan.reminderDate &&
              downloadIcs(
                "clearstep-reminder.ics",
                buildReminderIcs(
                  plan.reminderDate,
                  "ClearStep: return to my tax help plan",
                  "Your personal reminder to continue preparing for tax help. This is not a government deadline.",
                ),
              )
            }
          >
            <CalendarPlus aria-hidden /> Add to calendar (.ics)
          </Button>
        </div>
        <div className="mt-5 border-t pt-4 text-base">
          {deadlines === null ? (
            <p className="text-muted-foreground">Checking for verified deadlines…</p>
          ) : deadlines.length === 0 ? (
            <p className="text-muted-foreground">No official deadline verified for this plan.</p>
          ) : (
            <ul>
              {deadlines.map((d) => (
                <li key={d.date}>{d.label}: {d.date} (Official source: {getSource(d.sourceId).domain})</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="mt-10">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost"><RotateCcw aria-hidden /> Reset sample</Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl">Reset this plan?</AlertDialogTitle>
              <AlertDialogDescription className="text-base text-muted-foreground">
                This clears your answers, checklist, and reminder saved in this browser.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="min-h-12 text-base">Keep my plan</AlertDialogCancel>
              <AlertDialogAction
                className="min-h-12 bg-destructive text-base text-destructive-foreground hover:bg-destructive/90"
                onClick={() => { reset(); navigate({ to: "/" }); }}
              >
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <ExplainPanel item={explainItem} onClose={() => setExplainItem(null)} />
    </div>
  );
}

function Stage({ n, title, done, current, children }: { n: number; title: string; done: boolean; current: boolean; children: React.ReactNode }) {
  const Icon = done ? CheckCircle2 : current ? CircleDot : Circle;
  return (
    <li>
      <h3 className="flex items-center gap-3 text-2xl font-bold">
        <Icon className={cn("size-7 shrink-0", done ? "text-success" : current ? "text-primary" : "text-muted-foreground")} aria-hidden />
        <span>
          {n}. {title}
          <span className="sr-only"> — {done ? "done" : current ? "current" : "not started"}</span>
        </span>
      </h3>
      <div className="mt-4 sm:pl-10">{children}</div>
    </li>
  );
}

function UndoButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mt-3 inline-flex min-h-12 items-center font-bold text-primary underline">
      {label}
    </button>
  );
}
