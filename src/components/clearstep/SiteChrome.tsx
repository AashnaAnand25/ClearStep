import { Link } from "@tanstack/react-router";
import { Accessibility, ClipboardList, LogIn } from "lucide-react";
import { Brand } from "./Brand";

export function SiteHeader() {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-3 px-5 py-4">
        <Link
          to="/"
          className="inline-flex min-h-12 items-center text-xl font-bold text-foreground no-underline"
        >
          <Brand />
        </Link>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-2">
          <Link
            to="/plan"
            className="inline-flex min-h-12 items-center gap-2 rounded-md px-3 font-bold text-foreground hover:bg-accent"
            activeProps={{ "aria-current": "page", className: "underline" }}
          >
            <ClipboardList className="size-5" aria-hidden />
            My plan
          </Link>
          <Link
            to="/settings"
            className="inline-flex min-h-12 items-center gap-2 rounded-md border border-border-strong px-3 font-bold text-foreground hover:bg-accent"
            activeProps={{ "aria-current": "page", className: "bg-primary-soft" }}
          >
            <Accessibility className="size-5" aria-hidden />
            Settings
          </Link>
          <Link
            to="/login"
            className="inline-flex min-h-12 items-center gap-2 rounded-md px-3 font-bold text-foreground hover:bg-accent"
          >
            <LogIn className="size-5" aria-hidden />
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex max-w-[1080px] flex-wrap justify-between gap-2 px-5 py-6 text-sm text-muted-foreground">
        <p>ClearStep · A little help moving forward.</p>
        <p>Independent project. Not a government website.</p>
      </div>
    </footer>
  );
}
