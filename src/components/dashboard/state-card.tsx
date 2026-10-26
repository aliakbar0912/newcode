import { cn } from "@/lib/utils";

/**
 * The dashboard's base card. Quiet by design: hairline borders, near-black
 * surfaces, and a single small status dot instead of loud badges. Content
 * is honest — cards that depend on an integration say so in one short line,
 * never with placeholder data.
 */
export type CardStatus = "live" | "pending" | "error";

const STATUS_DOT: Record<CardStatus, string> = {
  live: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]",
  pending: "bg-zinc-600",
  error: "bg-red-400",
};

const STATUS_TITLE: Record<CardStatus, string> = {
  live: "Live data",
  pending: "Waiting for this integration",
  error: "Unavailable right now",
};

export function StateCard({
  title,
  status,
  actions,
  children,
  className,
  bodyClassName,
}: {
  /** Optional — omit for bare cards (e.g. tiles inside a grid). */
  title?: string;
  status?: CardStatus;
  /** Right-aligned slot in the title row (links, small buttons). */
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6",
        className
      )}
    >
      {title ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {status ? (
              <span
                title={STATUS_TITLE[status]}
                aria-hidden="true"
                className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[status])}
              />
            ) : null}
            <h2 className="truncate text-sm font-medium tracking-tight text-foreground">
              {title}
            </h2>
          </div>
          {actions}
        </div>
      ) : null}
      <div
        className={cn(
          "text-sm leading-relaxed text-zinc-400",
          title ? "mt-4" : undefined,
          bodyClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}

/** Compact metric tile used in overview grids. */
export function StatTile({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4",
        className
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1.5 truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {value}
      </p>
      {hint ? <p className="mt-0.5 truncate text-xs text-zinc-600">{hint}</p> : null}
    </div>
  );
}
