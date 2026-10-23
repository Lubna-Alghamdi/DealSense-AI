import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Notice, PageShell, PriorityControl, Panel, RankBadge, ReadyGate } from "@/components/app-ui";
import { NumberField } from "@/components/number-field";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSuppliers, useUpdateComparison, useUpdateSupplier } from "@/hooks/use-deal-data";
import { useComparisonResults } from "@/hooks/use-comparison-results";
import {
  calculateAllSuppliers,
  formatCurrency,
  formatLeadTime,
  formatQuantity,
  formatScore,
  getRecommendedSupplier,
  PRIORITY_LABELS,
  rankSuppliers,
  type Priority,
  type Supplier,
} from "@/lib/comparison";
import { cn } from "@/lib/utils";

export default function SimulatorRoute() {
  return <ReadyGate><SimulatorView /></ReadyGate>;
}

function SimulatorView() {
  const navigate = useNavigate();
  const updateComparison = useUpdateComparison();
  const updateSupplier = useUpdateSupplier();
  const { priority: savedPriority, requestedQuantity: savedQuantity } = useComparisonResults();
  const savedSuppliers = useSuppliers().data ?? [];

  const [priority, setPriority] = useState<Priority>(savedPriority);
  const [requestedQuantity, setRequestedQuantity] = useState(savedQuantity);
  const [draftSuppliers, setDraftSuppliers] = useState<Supplier[]>(savedSuppliers);
  const [visibleSupplierCount, setVisibleSupplierCount] = useState(2);

  const calculated = useMemo(() => calculateAllSuppliers(draftSuppliers, requestedQuantity), [draftSuppliers, requestedQuantity]);
  const isDirty = priority !== savedPriority || requestedQuantity !== savedQuantity || draftSuppliers.some((draft) => {
    const saved = savedSuppliers.find((row) => row.id === draft.id);
    return !saved || saved.unitPrice !== draft.unitPrice || saved.shippingCost !== draft.shippingCost;
  });

  function updateDraftSupplier(id: string, patch: Partial<Pick<Supplier, "unitPrice" | "shippingCost">>) {
    setDraftSuppliers((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }
  function discardChanges() { setPriority(savedPriority); setRequestedQuantity(savedQuantity); setDraftSuppliers(savedSuppliers); }
  function saveChanges() {
    if (priority !== savedPriority || requestedQuantity !== savedQuantity) updateComparison.mutate({ priority, requestedQuantity });
    for (const draft of draftSuppliers) {
      const saved = savedSuppliers.find((row) => row.id === draft.id);
      if (saved && (saved.unitPrice !== draft.unitPrice || saved.shippingCost !== draft.shippingCost)) {
        updateSupplier.mutate({ id: draft.id, unitPrice: draft.unitPrice, shippingCost: draft.shippingCost });
      }
    }
    toast.success("Scenario saved.");
  }

  const ranked = useMemo(() => rankSuppliers(calculated, priority), [calculated, priority]);
  const recommended = useMemo(() => getRecommendedSupplier(calculated, priority), [calculated, priority]);
  const visibleCalculated = calculated.slice(0, visibleSupplierCount);

  return (
    <PageShell title="Decision Simulator" subtitle="Test different purchasing priorities and see which supplier becomes the best choice.">
      <Panel className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-5 md:p-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-[1fr_auto] md:items-end md:gap-6">
          <div className="col-span-2 flex flex-col gap-2 md:col-span-1">
            <span className="text-sm font-medium text-navy">Priority Strategy</span>
            <PriorityControl value={priority} onChange={setPriority} />
          </div>
          <NumberField id="simulator-quantity" label="Requested Quantity" value={requestedQuantity} min={1} integer className="col-span-2 md:col-span-1 md:w-56" onValidChange={setRequestedQuantity} />
        </div>
        {recommended ? (
          <div className="rounded-xl border border-success/20 bg-success-bg p-4 text-success sm:p-5">
            <p className="text-base font-bold sm:text-lg">Recommended supplier: {recommended.name}</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:gap-3 lg:grid-cols-4">
              <Stat label="Lowest Cost" value={formatCurrency(recommended.totalCost)} />
              <Stat label="Delivery" value={formatLeadTime(recommended.leadTimeDays)} />
              <Stat label="Order Quantity" value={formatQuantity(recommended.orderQuantity)} />
              <Stat label="Balanced Score" value={formatScore(recommended.balancedScore)} />
            </dl>
            <p className="mt-3 text-xs opacity-80">Ranked by {PRIORITY_LABELS[priority].toLowerCase()}.</p>
          </div>
        ) : null}
      </Panel>

      <Panel className="flex flex-col gap-4 p-4 sm:p-5 md:p-8">
        <h2 className="text-lg font-semibold text-navy">Ranking</h2>
        <div className="flex flex-col gap-3 md:hidden">
          {ranked.map((row, index) => (
            <div key={row.id} className={cn("rounded-xl border border-border p-4", index === 0 && "bg-success-bg/60")}>
              <div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-semibold text-navy">{row.name}</h3><RankBadge rank={index + 1} /></div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <MobileMetric label="Total cost" value={formatCurrency(row.totalCost)} />
                <MobileMetric label="Delivery" value={formatLeadTime(row.leadTimeDays)} />
                <MobileMetric label="Cost score" value={formatScore(row.costScore)} />
                <MobileMetric label="Delivery score" value={formatScore(row.deliveryScore)} />
                <MobileMetric label="Balanced score" value={formatScore(row.balancedScore)} />
              </dl>
            </div>
          ))}
        </div>
        <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
          <Table className="min-w-[760px]">
            <TableHeader className="bg-secondary/60"><TableRow><TableHead>Rank</TableHead><TableHead>Supplier</TableHead><TableHead>Total Cost</TableHead><TableHead>Delivery</TableHead><TableHead>Cost Score</TableHead><TableHead>Delivery Score</TableHead><TableHead>Balanced Score</TableHead></TableRow></TableHeader>
            <TableBody>{ranked.map((row, index) => <TableRow key={row.id} className={cn(index === 0 && "bg-success-bg/60")}><TableCell><RankBadge rank={index + 1} /></TableCell><TableCell className="font-medium text-navy">{row.name}</TableCell><TableCell>{formatCurrency(row.totalCost)}</TableCell><TableCell>{formatLeadTime(row.leadTimeDays)}</TableCell><TableCell>{formatScore(row.costScore)}</TableCell><TableCell>{formatScore(row.deliveryScore)}</TableCell><TableCell className="font-semibold">{formatScore(row.balancedScore)}</TableCell></TableRow>)}</TableBody>
          </Table>
        </div>
      </Panel>

      <Panel className="flex flex-col gap-4 p-4 sm:p-5 md:p-8">
        <div><h2 className="text-lg font-semibold text-navy">Scenario inputs</h2><p className="text-sm text-muted-foreground">Edit unit price and shipping to test a new quotation. Results preview here until you save.</p></div>
        {calculated.length < 2 ? <Notice tone="warning">Add at least 2 suppliers to compare.</Notice> : null}
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          {visibleCalculated.map((row) => (
            <div key={row.id} className="grid grid-cols-2 gap-2 rounded-xl border border-border p-3 sm:gap-4 sm:p-4">
              <p className="col-span-2 font-semibold text-navy">{row.name}</p>
              <NumberField id={`unit-price-${row.id}`} label="Unit Price (SAR)" value={row.unitPrice} min={0} className="min-w-0" onValidChange={(value) => updateDraftSupplier(row.id, { unitPrice: value })} />
              <NumberField id={`shipping-${row.id}`} label="Shipping (SAR)" value={row.shippingCost} min={0} className="min-w-0" onValidChange={(value) => updateDraftSupplier(row.id, { shippingCost: value })} />
            </div>
          ))}
        </div>
        {visibleSupplierCount < calculated.length ? <Button type="button" variant="outline" className="md:hidden" onClick={() => setVisibleSupplierCount((count) => Math.min(count + 1, calculated.length))}>Add supplier</Button> : null}
        <div className="grid grid-cols-2 gap-2 border-t border-border pt-4 sm:flex sm:items-center sm:justify-end sm:gap-3">
          <p className="col-span-2 text-xs text-muted-foreground sm:mr-auto sm:text-sm">{isDirty ? "You have unsaved scenario changes." : "All scenario changes are saved."}</p>
          <Button type="button" variant="outline" className="h-10 px-4 sm:h-11 sm:px-5" disabled={!isDirty} onClick={discardChanges}>Discard</Button>
          <Button type="button" className="h-10 px-4 sm:h-11 sm:px-6" disabled={!isDirty} onClick={saveChanges}>Save changes</Button>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-between sm:gap-3">
        <Button type="button" variant="outline" className="h-10 px-3 sm:h-11 sm:px-5" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        <Button type="button" className="h-10 px-3 sm:h-11 sm:px-6" onClick={() => navigate("/report")}>Generate Final Report</Button>
      </div>
    </PageShell>
  );
}

function MobileMetric({ label, value }: { label: string; value: string }) { return <div className="flex flex-col border-b border-border/60 pb-2"><dt className="text-muted-foreground">{label}</dt><dd className="mt-0.5 font-semibold text-foreground">{value}</dd></div>; }
function Stat({ label, value }: { label: string; value: string }) { return <div className="flex min-w-0 flex-col gap-0.5 rounded-lg bg-background/20 p-2 sm:bg-transparent sm:p-0"><dt className="text-[10px] font-medium uppercase tracking-wide opacity-80 sm:text-xs">{label}</dt><dd className="truncate text-sm font-semibold sm:text-base">{value}</dd></div>; }
