import { cn } from "@/lib/cn";
import type { PubStatus } from "@/lib/data";

const statusStyles: Record<PubStatus, string> = {
  Published: "bg-emerald-400/10 text-emerald-300 border-emerald-400/25",
  Accepted: "bg-sky-400/10 text-sky-300 border-sky-400/25",
  "Under Review": "bg-amber-400/10 text-amber-300 border-amber-400/25",
  Submitted: "bg-foreground-faint/10 text-foreground-muted border-border-strong",
};

export function StatusBadge({ status }: { status: PubStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide",
        statusStyles[status]
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-current"
        aria-hidden="true"
      />
      {status}
    </span>
  );
}

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-3 py-1 text-xs font-medium text-foreground-muted",
        className
      )}
    >
      {children}
    </span>
  );
}
