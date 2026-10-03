import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getExplanation, type Explanation } from "@/lib/explanations";
import { getSource } from "@/data/sources";
import type { ChecklistItemRecord } from "@/data/checklist";

export function ExplainPanel({ item, onClose }: { item: ChecklistItemRecord | null; onClose: () => void }) {
  const [state, setState] = useState<"loading" | "ready" | "unavailable">("loading");
  const [data, setData] = useState<Explanation | null>(null);

  useEffect(() => {
    if (!item) return;
    let alive = true;
    setState("loading");
    getExplanation(item.id)
      .then((r) => {
        if (!alive) return;
        setData(r);
        setState(r ? "ready" : "unavailable");
      })
      .catch(() => alive && setState("unavailable"));
    return () => {
      alive = false;
    };
  }, [item]);

  const source = data ? getSource(data.sourceId) : item ? getSource(item.sourceId) : null;

  return (
    <Sheet open={!!item} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto bg-card p-6 sm:max-w-lg [&>button]:size-12">
        <SheetHeader className="p-0 pr-12 text-left">
          <p className="text-sm font-bold uppercase tracking-wide text-attention">Sample explanation</p>
          <SheetTitle className="text-2xl font-bold text-foreground">{item?.label}</SheetTitle>
          <SheetDescription className="text-base text-muted-foreground">
            Prewritten for this prototype. Not personalized advice.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6" aria-live="polite">
          {state === "loading" && <p className="text-muted-foreground">Loading explanation…</p>}
          {state === "unavailable" && (
            <p className="rounded-md bg-attention-soft p-4">
              An explanation isn't available for this item right now. You can still use the official source below.
            </p>
          )}
          {state === "ready" && data && (
            <>
              <section>
                <h3 className="text-lg font-bold">In plain language</h3>
                <p className="mt-1">{data.plainLanguage}</p>
              </section>
              <section>
                <h3 className="text-lg font-bold">What you can do next</h3>
                <ul className="mt-1 list-disc space-y-1 pl-6">
                  {data.nextSteps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </section>
            </>
          )}
          {source && state !== "loading" && (
            <section>
              <h3 className="text-lg font-bold">Where this comes from</h3>
              <p className="mt-1">
                {source.agency}: {source.title}
              </p>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex min-h-12 items-center gap-2 font-bold text-primary underline"
              >
                Open {source.domain} <ExternalLink className="size-4" aria-hidden />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
