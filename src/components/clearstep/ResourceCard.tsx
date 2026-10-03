import { ExternalLink, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SourceRecord } from "@/data/sources";

export function ResourceCard({ source, why }: { source: SourceRecord; why: string }) {
  return (
    <article className="rounded-lg border bg-card p-5">
      <p className="inline-flex items-center gap-2 text-sm font-bold text-primary">
        <Landmark className="size-4" aria-hidden /> Official source
      </p>
      <h4 className="mt-1 text-lg font-bold">{source.title}</h4>
      <dl className="mt-2 grid gap-x-4 gap-y-1 text-base sm:grid-cols-[auto_1fr]">
        <dt className="text-muted-foreground">Agency</dt>
        <dd>{source.agency}</dd>
        <dt className="text-muted-foreground">Website</dt>
        <dd className="font-bold">{source.domain}</dd>
      </dl>
      <p className="mt-3">{why}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button asChild>
          <a href={source.url} target="_blank" rel="noopener noreferrer">
            Open IRS.gov
            <ExternalLink aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </Button>
        <details className="group">
          <summary className="inline-flex min-h-12 cursor-pointer items-center rounded-md px-3 font-bold text-primary underline">
            View source
          </summary>
          <div className="mt-2 rounded-md bg-muted p-4 text-base">
            <p className="text-sm text-muted-foreground">Summary of source</p>
            <p>{source.supportingExcerpt}</p>
            <p className="mt-2 break-all text-sm">{source.url}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {source.reviewedAt
                ? `Reviewed ${source.reviewedAt}`
                : "Not yet reviewed by ClearStep."}
            </p>
          </div>
        </details>
      </div>
    </article>
  );
}
