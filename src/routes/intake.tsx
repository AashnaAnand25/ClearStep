import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlan, type FirstTime, type HelpChoice } from "@/lib/plan-store";

export const Route = createFileRoute("/intake")({
  head: () => ({
    meta: [
      { title: "A few quick questions — ClearStep" },
      { name: "description", content: "Two short questions to tailor your tax help starting point. No personal or financial details." },
      { property: "og:title", content: "A few quick questions — ClearStep" },
      { property: "og:description", content: "Two short questions to tailor your tax help starting point." },
    ],
  }),
  component: IntakePage,
});

const QUESTIONS = [
  {
    key: "help" as const,
    title: "What would help most?",
    options: [
      { value: "person", label: "Someone to help me" },
      { value: "online", label: "An online filing option" },
      { value: "unsure", label: "I'm not sure" },
    ],
  },
  {
    key: "firstTime" as const,
    title: "Are you preparing to file for the first time?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Not sure" },
    ],
  },
];

function IntakePage() {
  const { plan, update } = usePlan();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const q = QUESTIONS[step];
  const value = plan.answers[q.key];

  const onContinue = () => {
    if (!value) {
      setError(true);
      return;
    }
    setError(false);
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else {
      update((p) => ({ ...p, isSample: false, intakeComplete: true }));
      navigate({ to: "/plan" });
    }
  };

  return (
    <div className="max-w-2xl">
      <p className="text-base font-bold text-muted-foreground">
        Question {step + 1} of {QUESTIONS.length}
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onContinue();
        }}
      >
        <fieldset className="mt-3" aria-describedby={error ? "intake-error" : "intake-note"}>
          <legend className="contents">
            <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-bold sm:text-4xl">
              {q.title}
            </h1>
          </legend>
          <div className="mt-8 grid gap-3">
            {q.options.map((o) => {
              const checked = value === o.value;
              return (
                <label
                  key={o.value}
                  className="flex min-h-14 cursor-pointer items-center gap-4 rounded-lg border border-border-strong bg-card px-5 py-3 text-lg has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ring"
                >
                  <input
                    type="radio"
                    name={q.key}
                    value={o.value}
                    checked={checked}
                    onChange={() => {
                      setError(false);
                      update((p) => ({
                        ...p,
                        answers: { ...p.answers, [q.key]: o.value as HelpChoice & FirstTime },
                      }));
                    }}
                    className="size-6 accent-primary"
                  />
                  {o.label}
                </label>
              );
            })}
          </div>
        </fieldset>
        {error && (
          <p id="intake-error" role="alert" className="mt-4 font-bold text-destructive">
            Choose an option to continue.
          </p>
        )}
        <p id="intake-note" className="mt-6 text-base text-muted-foreground">
          Your answers only shape the explanations and suggested starting point. They don't decide what you owe or what you qualify for.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => (step === 0 ? navigate({ to: "/" }) : setStep(step - 1))}
          >
            <ArrowLeft aria-hidden /> Back
          </Button>
          <Button type="submit">
            Continue <ArrowRight aria-hidden />
          </Button>
        </div>
      </form>
    </div>
  );
}
