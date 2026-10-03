import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Chrome } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — ClearStep" },
      {
        name: "description",
        content: "Sign in to keep your ClearStep journey available across devices.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="mx-auto grid max-w-4xl gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
      <section aria-labelledby="login-title">
        <Link to="/" className="inline-flex items-center gap-2 font-bold text-primary">
          <ArrowLeft className="size-4" aria-hidden />
          Back to ClearStep
        </Link>
        <p className="eyebrow mt-12">Welcome back</p>
        <h1 id="login-title" className="mt-3 text-4xl font-bold">
          Sign in to keep your place.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Save your ClearStep journey and access it on another device when account sign-in is
          available.
        </p>
      </section>
      <section
        className="rounded-2xl border bg-card p-7 shadow-focus-card sm:p-9"
        aria-label="Sign in"
      >
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Chrome aria-hidden />
        </div>
        <h2 className="mt-6 text-2xl font-bold">Continue with Google</h2>
        <p className="mt-2 text-muted-foreground">
          Google sign-in will securely connect your saved journey.
        </p>
        <button
          type="button"
          disabled
          className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-border-strong bg-card px-5 font-bold text-foreground opacity-60"
        >
          <Chrome className="size-5" aria-hidden />
          Continue with Google
        </button>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Account sign-in is coming soon. You can use ClearStep without an account today.
        </p>
        <ul className="mt-7 space-y-3 border-t pt-6 text-sm text-muted-foreground">
          {[
            "No tax details are collected for sign-in",
            "Your local plan remains available",
            "You can continue without an account",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check className="size-4 text-success" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
