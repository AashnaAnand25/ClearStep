/** ClearStep's original stair-and-arrow mark, shared by the wordmark and favicon. */
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <svg viewBox="0 0 64 64" className="size-10 shrink-0" fill="none" aria-hidden="true">
        <rect width="64" height="64" rx="18" fill="#145b60" />
        <path
          d="M18 43V33h12V22h16"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m38 14 9 8-9 8"
          stroke="#c8e9dc"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {!compact && (
        <span className="text-2xl font-bold tracking-tight">
          ClearStep<span className="text-primary">.</span>
        </span>
      )}
    </span>
  );
}
