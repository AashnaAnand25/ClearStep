import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookmarkCheck,
  FileText,
  LockKeyhole,
  Landmark,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlan } from "@/lib/plan-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ClearStep — Government paperwork, one clear next step" },
      {
        name: "description",
        content:
          "Find an official starting point for tax help, understand what to prepare, and pick up where you left off.",
      },
      { property: "og:title", content: "ClearStep — One clear next step" },
      {
        property: "og:description",
        content: "A simpler way to get ready for government paperwork.",
      },
    ],
  }),
  component: StartPage,
});

function StartPage() {
  const { plan, hydrated, loadSample } = usePlan();
  const navigate = useNavigate();
  const hasPlan = hydrated && plan.intakeComplete && !plan.isSample;
  return (
    <div className="home-enter">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <section aria-labelledby="welcome-title">
          <p className="eyebrow mb-5">A simpler start</p>
          <h1
            id="welcome-title"
            className="text-[2.75rem] font-bold leading-[1.08] tracking-tight sm:text-[3.6rem]"
          >
            Government paperwork.
            <br />
            <span className="text-primary">One clear next step.</span>
          </h1>
          <p className="mt-6 max-w-lg text-xl text-muted-foreground">
            You don’t need to know all the answers. Find the official starting point, understand
            what you need, and keep your place.
          </p>
          <div className="mt-8 flex items-center gap-2 text-base text-muted-foreground">
            <LockKeyhole className="size-4 shrink-0" aria-hidden="true" />
            No account. No sensitive details.
          </div>
        </section>

        <section
          aria-labelledby="journey-title"
          className="journey-card relative rounded-2xl border bg-card p-7 shadow-focus-card sm:p-9"
        >
          <div className="mb-7 flex items-center justify-between gap-4">
            <span className="flex size-14 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <FileText className="size-7" aria-hidden="true" />
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-sm font-bold text-muted-foreground">
              Your first step starts here
            </span>
          </div>
          <h2 id="journey-title" className="text-3xl font-bold">
            Get help with my taxes
          </h2>
          <p className="mt-3 text-muted-foreground">
            Find a place to start and a simple plan to get ready.
          </p>
          <ol className="my-7 space-y-4 border-y py-6 text-base">
            {[
              "Find your official starting point",
              "Prepare what you need",
              "Continue with the provider",
            ].map((text, index) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                  {index + 1}
                </span>
                {text}
              </li>
            ))}
          </ol>
          <Button
            size="lg"
            className="w-full justify-between"
            disabled={!hydrated}
            asChild={hydrated}
          >
            {hydrated ? (
              <Link to={hasPlan || plan.isSample ? "/plan" : "/intake"}>
                {hasPlan ? "Continue my plan" : plan.isSample ? "Continue sample" : "Get started"}
                <ArrowRight aria-hidden="true" />
              </Link>
            ) : (
              <span>Getting ready…</span>
            )}
          </Button>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Two short questions. Go at your own pace.
          </p>
        </section>
      </div>
      <div className="mt-8 text-center lg:text-right">
        <button
          type="button"
          disabled={!hydrated}
          onClick={() => {
            loadSample();
            navigate({ to: "/plan" });
          }}
          className="inline-flex min-h-12 items-center gap-2 rounded-md font-bold text-primary underline"
        >
          Take a look at a sample plan <ArrowRight className="size-4" aria-hidden="true" />
        </button>
        <p className="text-sm text-muted-foreground">
          A fictional example. Your own progress stays saved.
        </p>
      </div>
      <section
        aria-label="How ClearStep helps"
        className="mt-12 grid gap-7 border-t pt-8 sm:grid-cols-3"
      >
        {[
          {
            icon: Landmark,
            title: "Know where you’re going",
            body: "See the agency and website before you follow a link.",
          },
          {
            icon: ListChecks,
            title: "Make sense of the details",
            body: "Plain-language explanations, with the source close by.",
          },
          {
            icon: BookmarkCheck,
            title: "Pick up where you left off",
            body: "Your checklist stays saved in this browser.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title}>
            <Icon className="mb-3 size-6 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-2 text-base text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
