import { useMemo } from "react";

import { LinkButton, Notice, PageShell, Panel, ReadyGate } from "@/components/app-ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useComparison } from "@/hooks/use-deal-data";
import { useComparisonResults } from "@/hooks/use-comparison-results";
import {
  formatCurrency,
  formatLeadTime,
  formatQuantity,
  formatUnitCost,
  getFastestSupplier,
  getLowestCostSupplier,
  type CalculatedSupplier,
} from "@/lib/comparison";

export default function DashboardRoute() {
  return (
    <ReadyGate>
      <DashboardView />
    </ReadyGate>
  );
}

function DashboardView() {
  const { calculated } = useComparisonResults();
  const lowest = useMemo(() => getLowestCostSupplier(calculated), [calculated]);
  const fastest = useMemo(() => getFastestSupplier(calculated), [calculated]);
  const comparison = useComparison();
  const targetBudget = comparison.data?.targetBudget ?? null;
  const maxLeadTimeDays = comparison.data?.maxLeadTimeDays ?? null;

  return (
    <PageShell
      title="Comparison Dashboard"
      subtitle="A quick overview of your suppliers and key purchasing metrics."
    >
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <SummaryCard label="Suppliers Compared" value={String(calculated.length)} />
        <SummaryCard
          label="Lowest Total Cost"
          value={lowest ? formatCurrency(lowest.totalCost) : "—"}
          detail={lowest?.name}
        />
        <SummaryCard
          label="Fastest Lead Time"
          value={fastest ? formatLeadTime(fastest.leadTimeDays) : "—"}
          detail={fastest?.name}
        />
      </div>

      <Panel className="flex flex-col gap-4 p-0 md:p-0">
        <div className="overflow-x-auto overscroll-x-contain">
          <Table className="min-w-[860px]">
            <TableHeader className="bg-secondary/60">
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Order Qty</TableHead>
                <TableHead>MOQ Extra</TableHead>
                <TableHead>Product Cost</TableHead>
                <TableHead>Shipping</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Lead Time</TableHead>
                <TableHead>Cost / Purchased Unit</TableHead>
                <TableHead>Requirements</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calculated.map((row) => {
                const isLowest = row.id === lowest?.id;
                const isFastest = row.id === fastest?.id;
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium text-navy">{row.name}</TableCell>
                    <TableCell>{formatQuantity(row.orderQuantity)}</TableCell>
                    <TableCell>
                      {row.extraUnits > 0 ? (
                        <span className="rounded-md bg-warning-bg px-2 py-0.5 text-xs font-semibold text-warning">
                          {formatQuantity(row.extraUnits)} extra
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(row.productCost)}</TableCell>
                    <TableCell>{formatCurrency(row.shippingCost)}</TableCell>
                    <TableCell>
                      <span className={isLowest ? "font-semibold text-success" : undefined}>
                        {formatCurrency(row.totalCost)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={isFastest ? "font-semibold text-success" : undefined}>
                        {formatLeadTime(row.leadTimeDays)}
                      </span>
                    </TableCell>
                    <TableCell>{formatUnitCost(row.costPerUnit)}</TableCell>
                    <TableCell>
                      <RequirementFlags
                        row={row}
                        targetBudget={targetBudget}
                        maxLeadTimeDays={maxLeadTimeDays}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Panel>

      {calculated.some((row) => row.extraUnits > 0) ? (
        <Notice tone="warning">
          Some suppliers have an MOQ above the requested quantity, so you will buy extra units.
        </Notice>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
        <LinkButton to="/simulator">Open Decision Simulator</LinkButton>
        <LinkButton to="/suppliers" variant="secondary">
          Edit Suppliers
        </LinkButton>
      </div>
    </PageShell>
  );
}

function RequirementFlags({
  row,
  targetBudget,
  maxLeadTimeDays,
}: {
  row: CalculatedSupplier;
  targetBudget: number | null;
  maxLeadTimeDays: number | null;
}) {
  if (targetBudget === null && maxLeadTimeDays === null) return <span>—</span>;

  const issues: string[] = [];
  if (targetBudget !== null && row.totalCost > targetBudget) issues.push("Over budget");
  if (maxLeadTimeDays !== null && row.leadTimeDays > maxLeadTimeDays) issues.push("Too slow");

  if (issues.length === 0) {
    return (
      <span className="rounded-md bg-success-bg px-2 py-0.5 text-xs font-semibold text-success">
        Meets requirements
      </span>
    );
  }
  return (
    <span className="rounded-md bg-danger-bg px-2 py-0.5 text-xs font-semibold text-danger">
      {issues.join(" · ")}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <Panel className="flex min-w-0 flex-col gap-1 p-3 sm:gap-2 sm:p-5">
      <span className="text-[11px] font-medium leading-tight text-muted-foreground sm:text-sm">{label}</span>
      <span className="truncate text-base font-bold text-navy sm:text-2xl">{value}</span>
      {detail ? <span className="truncate text-[11px] text-muted-foreground sm:text-sm">{detail}</span> : null}
    </Panel>
  );
}
