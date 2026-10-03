import { useId, useState } from "react";
import { Check, ChevronDown, CircleHelp, HelpCircle, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChecklistItemRecord } from "@/data/checklist";
import type { ItemStatus } from "@/lib/plan-store";
import { getSource } from "@/data/sources";

interface Props {
  item: ChecklistItemRecord;
  status: ItemStatus;
  isNext: boolean;
  onStatus: (s: ItemStatus) => void;
  onExplain: () => void;
}

export function ChecklistItem({ item, status, isNext, onStatus, onExplain }: Props) {
  const [open, setOpen] = useState(false);
  const expanded = open || status === "help";
  const panelId = useId();
  const source = getSource(item.sourceId);
  const helpSource = getSource(item.helpAction.sourceId);

  return (
    <li
      id={`item-${item.id}`}
      className={cn(
        "rounded-lg border bg-card p-5",
        isNext && "border-primary ring-1 ring-primary",
        status === "help" && "border-attention ring-1 ring-attention",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-lg font-bold">{item.label}</h4>
          {item.condition && (
            <p className="mt-1 text-base text-muted-foreground">{item.condition}</p>
          )}
          <p className="text-sm text-muted-foreground">
            {status === "skipped"
              ? "Does not apply"
              : status === "ready"
                ? "Ready"
                : status === "help"
                  ? "You asked for help"
                  : "Not started"}
            {isNext && " · Your next step"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label={`Status for ${item.label}`}>
          <button
            type="button"
            aria-pressed={status === "ready"}
            onClick={() => onStatus(status === "ready" ? "todo" : "ready")}
            className="inline-flex min-h-12 items-center gap-2 rounded-md border border-border-strong px-4 font-bold hover:bg-accent aria-pressed:border-success aria-pressed:bg-success-soft aria-pressed:text-success"
          >
            <Check className="size-5" aria-hidden /> Ready
          </button>
          <button
            type="button"
            aria-pressed={status === "help"}
            onClick={() => onStatus(status === "help" ? "todo" : "help")}
            className="inline-flex min-h-12 items-center gap-2 rounded-md border border-border-strong px-4 font-bold hover:bg-accent aria-pressed:border-attention aria-pressed:bg-attention-soft aria-pressed:text-attention"
          >
            <HelpCircle className="size-5" aria-hidden /> Need help
          </button>
        </div>
      </div>
      {item.optional && (
        <button
          type="button"
          aria-pressed={status === "skipped"}
          onClick={() => onStatus(status === "skipped" ? "todo" : "skipped")}
          className="mt-2 inline-flex min-h-12 items-center rounded-md text-base font-bold text-primary underline"
        >
          {status === "skipped" ? "Include this item again" : "This doesn’t apply to me"}
        </button>
      )}
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        disabled={status === "help"}
        className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-md font-bold text-primary underline disabled:no-underline disabled:opacity-100"
      >
        <CircleHelp className="size-5" aria-hidden /> Why do I need this?
        {status !== "help" && (
          <ChevronDown
            className={cn("size-5 transition-transform", expanded && "rotate-180")}
            aria-hidden
          />
        )}
      </button>
      {expanded && (
        <div id={panelId} className="mt-2 rounded-md bg-muted p-4">
          <p>{item.why}</p>
          {status === "help" && (
            <div className="mt-3 border-t pt-3">
              <p className="font-bold">What you can do next</p>
              <p>{item.helpAction.text}</p>
              <a
                href={helpSource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center font-bold text-primary underline"
              >
                {item.helpAction.linkLabel}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
            <button
              type="button"
              onClick={onExplain}
              className="inline-flex min-h-12 items-center gap-2 font-bold text-primary underline"
            >
              <MessageSquareText className="size-5" aria-hidden /> Explain this
            </button>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center font-bold text-primary underline"
            >
              Source: {source.domain}
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>
      )}
    </li>
  );
}
