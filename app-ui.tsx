import { IconAlertTriangle, IconCircleCheck, IconInfoCircle } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import { Skeleton } from "@/components/ui/skeleton";
import { useComparison, useSuppliers } from "@/hooks/use-deal-data";
import { PRIORITY_OPTIONS, type Priority } from "@/lib/comparison";
import { cn } from "@/lib/utils";

export function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1150px] flex-col gap-6 px-4 py-8 md:px-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-navy md:text-3xl">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground md:text-base">{subtitle}</p> : null}
      </header>
      {children}
    </div>
  );
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "deal-panel rounded-3xl border border-border bg-card/70 p-5 md:p-8",
        className,
      )}
    >
      {children}
    </section>
  );
}

const NOTICE_TONES = {
  success: { className: "bg-success-bg text-success", Icon: IconCircleCheck },
  warning: { className: "bg-warning-bg text-warning", Icon: IconAlertTriangle },
  error: { className: "bg-danger-bg text-danger", Icon: IconAlertTriangle },
  info: { className: "bg-secondary text-foreground", Icon: IconInfoCircle },
} as const;

export function Notice({
  tone,
  children,
  className,
}: {
  tone: keyof typeof NOTICE_TONES;
  children: ReactNode;
  className?: string;
}) {
  const { className: toneClass, Icon } = NOTICE_TONES[tone];
  return (
    <div
      role={tone === "error" || tone === "warning" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-xl p-4 text-sm font-medium", toneClass, className)}
    >
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">{children}</div>
    </div>
  );
}

export function LinkButton({
  to,
  children,
  variant = "primary",
}: {
  to: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        variant === "primary"
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
          : "border border-border bg-card/60 text-foreground hover:bg-accent",
      )}
    >
      {children}
    </Link>
  );
}

export function PriorityControl({
  value,
  onChange,
}: {
  value: Priority;
  onChange: (priority: Priority) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Priority strategy"
      className="inline-flex w-full flex-wrap gap-2 rounded-xl bg-secondary p-1 sm:w-auto"
    >
      {PRIORITY_OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-10 flex-1 rounded-lg px-4 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring sm:flex-none",
              selected
                ? "bg-card text-navy shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 min-w-9 items-center justify-center rounded-full px-2 text-xs font-bold",
        rank === 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
      )}
    >
      #{rank}
    </span>
  );
}

export function TableSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

/**
 * Renders children only once a product and at least two suppliers exist;
 * otherwise points the user to the step that is still missing.
 */
export function ReadyGate({ children }: { children: ReactNode }) {
  const comparison = useComparison();
  const suppliers = useSuppliers();

  if (comparison.isLoading || suppliers.isLoading) {
    return (
      <PageShell title="Loading">
        <Panel>
          <TableSkeleton />
        </Panel>
      </PageShell>
    );
  }

  if (!comparison.data?.productName) {
    return (
      <PageShell title="Comparison not started">
        <Notice tone="warning">
          <span>Create a comparison before opening this step.</span>
          <div className="pt-2">
            <LinkButton to="/create">Go to Create Comparison</LinkButton>
          </div>
        </Notice>
      </PageShell>
    );
  }

  if ((suppliers.data?.length ?? 0) < 2) {
    return (
      <PageShell title="More suppliers needed">
        <Notice tone="warning">
          <span>Add at least 2 suppliers before opening this step.</span>
          <div className="pt-2">
            <LinkButton to="/suppliers">Go to Add Suppliers</LinkButton>
          </div>
        </Notice>
      </PageShell>
    );
  }

  return <>{children}</>;
}
