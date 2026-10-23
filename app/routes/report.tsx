import {
  IconAlertTriangle,
  IconCircleCheck,
  IconCoin,
  IconDownload,
  IconFileText,
  IconInfoCircle,
  IconPackage,
  IconScale,
  IconTarget,
  IconTruckDelivery,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useMemo } from "react";

import { LinkButton, ReadyGate } from "@/components/app-ui";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useComparisonResults } from "@/hooks/use-comparison-results";
import {
  formatCurrency,
  formatLeadTime,
  formatQuantity,
  formatUnitCost,
  getRecommendedSupplier,
  PRIORITY_LABELS,
} from "@/lib/comparison";
import { buildReportAssumptions } from "@/lib/report-assumptions";
import { downloadReportPdf } from "@/lib/report-pdf";

export default function ReportRoute() {
  return (
    <ReadyGate>
      <ReportView />
    </ReadyGate>
  );
}

function ReportView() {
  const { productName, requestedQuantity, priority, calculated } = useComparisonResults();
  const recommended = useMemo(
    () => getRecommendedSupplier(calculated, priority),
    [calculated, priority],
  );
  const assumptions = useMemo(
    () =>
      buildReportAssumptions({
        productName,
        requestedQuantity,
        priority,
        recommended,
        rows: calculated,
      }),
    [productName, requestedQuantity, priority, recommended, calculated],
  );

  return (
    <div className="mx-auto w-full max-w-[1000px] px-3 py-4 sm:px-4 sm:py-8 md:px-8">
      <article className="report-card flex flex-col gap-4 rounded-3xl border border-border bg-card p-3 sm:gap-6 sm:p-4 md:p-8">
        <header className="relative overflow-hidden rounded-2xl border border-border bg-secondary/40 p-4 sm:p-6 md:p-10">
          <div className="flex items-start justify-between gap-4 sm:gap-6">
            <div className="flex min-w-0 flex-col gap-2 sm:gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:text-xs sm:tracking-[0.2em]">
                DealSense AI · Supplier Comparison
              </p>
              <h1 className="font-serif text-3xl leading-tight font-semibold text-foreground sm:text-4xl md:text-5xl">
                Final Comparison Report
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">Prepared for {productName}</p>
            </div>
            <span
              aria-hidden="true"
              className="hidden size-14 shrink-0 items-center justify-center rounded-full border border-border bg-card text-primary sm:inline-flex"
            >
              <IconFileText size={26} />
            </span>
          </div>
          <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4 sm:mt-8 sm:gap-4 sm:pt-6">
            <MetaItem icon={<IconPackage size={18} />} label="Product" value={productName} />
            <MetaItem
              icon={<IconScale size={18} />}
              label="Requested quantity"
              value={formatQuantity(requestedQuantity)}
            />
            <MetaItem
              icon={<IconTarget size={18} />}
              label="Priority"
              value={PRIORITY_LABELS[priority]}
            />
          </dl>
        </header>

        {recommended ? (
          <section className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:gap-5 sm:p-5 md:p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground sm:size-10">
                <IconCircleCheck size={20} aria-hidden="true" />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:text-xs sm:tracking-[0.15em]">
                  Recommended supplier
                </span>
                <h2 className="truncate font-serif text-xl font-semibold text-navy sm:text-2xl">{recommended.name}</h2>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <Stat icon={<IconCoin size={18} />} label="Total cost" value={formatCurrency(recommended.totalCost)} />
              <Stat
                icon={<IconTruckDelivery size={18} />}
                label="Delivery"
                value={formatLeadTime(recommended.leadTimeDays)}
              />
              <Stat
                icon={<IconPackage size={18} />}
                label="Purchase quantity"
                value={formatQuantity(recommended.orderQuantity)}
              />
            </div>
          </section>
        ) : null}

        <section className="flex flex-col gap-3">
          <SectionTitle icon={<IconScale size={18} />} title="Supplier comparison" />
          <div className="overflow-x-auto overscroll-x-contain rounded-xl border border-border">
            <Table className="min-w-[640px]">
              <TableHeader className="bg-secondary/60">
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Order Qty</TableHead>
                  <TableHead>MOQ extra</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Lead Time</TableHead>
                  <TableHead>Cost / purchased unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculated.map((row) => {
                  const isRecommended = recommended?.id === row.id;
                  return (
                    <TableRow key={row.id} className={isRecommended ? "bg-primary/10" : undefined}>
                      <TableCell className="font-medium text-navy">
                        <span className="flex items-center gap-2">
                          {row.name}
                          {isRecommended ? (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                              Recommended
                            </span>
                          ) : null}
                        </span>
                      </TableCell>
                      <TableCell>{formatQuantity(row.orderQuantity)}</TableCell>
                      <TableCell>
                        {row.extraUnits > 0 ? (
                          <span className="inline-flex items-center gap-1 text-warning">
                            <IconAlertTriangle size={14} aria-hidden="true" />
                            {`${formatQuantity(row.extraUnits)} extra`}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(row.totalCost)}</TableCell>
                      <TableCell>{formatLeadTime(row.leadTimeDays)}</TableCell>
                      <TableCell>{formatUnitCost(row.costPerUnit)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="flex flex-col gap-3 sm:gap-4">
          <SectionTitle icon={<IconInfoCircle size={18} />} title="Assumptions" />
          <ol className="grid grid-cols-2 gap-2 sm:gap-3">
            {assumptions.map((text, index) => (
              <li key={text} className="flex min-w-0 flex-col gap-1 rounded-xl border border-border p-3 text-xs sm:flex-row sm:gap-4 sm:p-4 sm:text-sm">
                <span className="font-serif text-sm font-semibold text-primary sm:text-lg">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-muted-foreground">{text}</span>
              </li>
            ))}
          </ol>
          <p className="text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
            DealSense AI provides recommendations based only on the entered quotation data and does not
            verify supplier reliability, product quality, tax, customs, or external purchasing costs.
          </p>
        </section>

        <footer className="no-print grid grid-cols-2 gap-2 border-t border-border pt-4 sm:flex sm:items-center sm:justify-between sm:gap-3 sm:pt-6">
          <Button
            type="button"
            className="h-10 px-3 text-primary-foreground sm:h-11 sm:px-5"
            onClick={() =>
              downloadReportPdf({
                productName,
                requestedQuantity,
                priority,
                recommended,
                rows: calculated,
              })
            }
          >
            <IconDownload size={18} aria-hidden="true" />
            Download Report
          </Button>
          <LinkButton to="/simulator" variant="secondary">
            Back to Simulator
          </LinkButton>
        </footer>
      </article>
    </div>
  );
}

function MetaItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
      <span className="text-primary sm:mt-0.5">{icon}</span>
      <div className="flex min-w-0 flex-col">
        <dt className="text-[9px] uppercase tracking-wider text-muted-foreground sm:text-xs">{label}</dt>
        <dd className="truncate text-xs font-medium text-foreground sm:text-sm">{value}</dd>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-border bg-card/60 p-2 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-primary sm:size-9">
        {icon}
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-[10px] text-muted-foreground sm:text-xs">{label}</span>
        <span className="truncate text-xs font-semibold text-foreground sm:text-base">{value}</span>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-navy sm:text-2xl">
      <span className="text-primary">{icon}</span>
      {title}
    </h2>
  );
}
