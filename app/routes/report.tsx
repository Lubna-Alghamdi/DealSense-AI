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
    <div className="mx-auto w-full max-w-[1000px] px-4 py-8 md:px-8">
      <article className="report-card flex flex-col gap-6 rounded-3xl border border-border bg-card p-4 md:p-8">
        <header className="relative overflow-hidden rounded-2xl border border-border bg-secondary/40 p-6 md:p-10">
          <div className="flex items-start justify-between gap-6">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                DealSense AI · Supplier Comparison
              </p>
              <h1 className="font-serif text-4xl leading-tight font-semibold text-foreground md:text-5xl">
                Final Comparison Report
              </h1>
              <p className="text-sm text-muted-foreground">Prepared for {productName}</p>
            </div>
            <span
              aria-hidden="true"
              className="hidden size-14 shrink-0 items-center justify-center rounded-full border border-border bg-card text-primary sm:inline-flex"
            >
              <IconFileText size={26} />
            </span>
          </div>
          <dl className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-3">
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
          <section className="flex flex-col gap-5 rounded-2xl border border-primary/30 bg-primary/5 p-5 md:p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <IconCircleCheck size={20} aria-hidden="true" />
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Recommended supplier
                </span>
                <h2 className="font-serif text-2xl font-semibold text-navy">{recommended.name}</h2>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
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
          <div className="overflow-x-auto rounded-xl border border-border">
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

        <section className="flex flex-col gap-4">
          <SectionTitle icon={<IconInfoCircle size={18} />} title="Assumptions" />
          <ol className="flex flex-col gap-3">
            {assumptions.map((text, index) => (
              <li key={text} className="flex gap-4 rounded-xl border border-border p-4 text-sm">
                <span className="font-serif text-lg font-semibold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-muted-foreground">{text}</span>
              </li>
            ))}
          </ol>
          <p className="text-xs text-muted-foreground">
            DealSense AI provides recommendations based only on the entered quotation data and does not
            verify supplier reliability, product quality, tax, customs, or external purchasing costs.
          </p>
        </section>

        <footer className="no-print flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            className="h-11 px-5 text-primary-foreground"
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
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div className="flex flex-col">
        <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium text-foreground">{value}</dd>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-4">
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
        {icon}
      </span>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-base font-semibold text-foreground">{value}</span>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold text-navy">
      <span className="text-primary">{icon}</span>
      {title}
    </h2>
  );
}
