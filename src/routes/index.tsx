import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlan } from "@/lib/plan-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ClearStep — Let's make the next step clear" },
      { name: "description", content: "Find the official starting point for tax help, understand what you need, and keep your place." },
      { property: "og:title", content: "ClearStep — Let's make the next step clear" },
      { property: "og:description", content: "Find the official starting point for tax help and keep your place." },
    ],
  }),
  component: StartPage,
});

function StartPage() {
  const { plan, hydrated, startFresh, loadSample } = usePlan();
  const navigate = useNavigate();
  const hasPlan = hydrated && plan.intakeComplete && !plan.isSample;

  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-bold sm:text-5xl">Let's make the next step clear.</h1>
      <p className="mt-5 text-xl text-muted-foreground">
        Find the official starting point, understand what you need, and keep your place.
      </p>

      <section aria-labelledby="journey-title" className="mt-12 rounded-xl border bg-card p-7 shadow-card sm:p-9">
        <FileText className="size-8 text-primary" aria-hidden />
        <h2 id="journey-title" className="mt-4 text-2xl font-bold sm:text-3xl">Get help with my taxes</h2>
        <p className="mt-2 text-lg text-muted-foreground">Find an official starting point and prepare for your next step.</p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          {hasPlan ? (
            <>
              <Button size="lg" asChild>
                <Link to="/plan">Continue my plan <ArrowRight aria-hidden /></Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  startFresh();
                  navigate({ to: "/intake" });
                }}
              >
                Start over
              </Button>
            </>
          ) : (
            <Button
              size="lg"
              onClick={() => {
                if (plan.isSample) startFresh();
                navigate({ to: "/intake" });
              }}
            >
              Get started <ArrowRight aria-hidden />
            </Button>
          )}
        </div>
      </section>

      <p className="mt-8">
        <button
          type="button"
          onClick={() => {
            loadSample();
            navigate({ to: "/plan" });
          }}
          className="inline-flex min-h-12 items-center font-bold text-primary underline hover:text-primary-hover"
        >
          Try a sample plan
        </button>
        <span className="text-muted-foreground"> — a fictional demo with example progress.</span>
      </p>
    </div>
  );
}
