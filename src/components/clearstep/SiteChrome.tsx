import { Link } from "@tanstack/react-router";
import { ClipboardList, Type } from "lucide-react";
import { usePlan } from "@/lib/plan-store";

export function SiteHeader() {
  const { largeText, setLargeText } = usePlan();
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-3 px-5 py-3">
        <Link to="/" className="inline-flex min-h-12 items-center text-xl font-bold text-foreground no-underline">
          ClearStep
        </Link>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-2">
          <Link
            to="/plan"
            className="inline-flex min-h-12 items-center gap-2 rounded-md px-4 font-bold text-foreground hover:bg-accent"
            activeProps={{ "aria-current": "page", className: "underline" }}
          >
            <ClipboardList className="size-5" aria-hidden />
            My plan
          </Link>
          <button
            type="button"
            aria-pressed={largeText}
            onClick={() => setLargeText(!largeText)}
            className="inline-flex min-h-12 items-center gap-2 rounded-md border border-border-strong px-4 font-bold text-foreground hover:bg-accent aria-pressed:bg-primary-soft aria-pressed:border-primary"
          >
            <Type className="size-5" aria-hidden />
            Larger text
          </button>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t">
      <p className="mx-auto max-w-[1080px] px-5 py-6 text-sm text-muted-foreground">
        Independent project. Not a government website.
      </p>
    </footer>
  );
}
