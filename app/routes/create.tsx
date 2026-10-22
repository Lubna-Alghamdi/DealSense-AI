import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";

import { Notice, PageShell, Panel, PriorityControl } from "@/components/app-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useComparison, useUpdateComparison, type Comparison } from "@/hooks/use-deal-data";
import type { Priority } from "@/lib/comparison";

export default function CreateRoute() {
  const comparison = useComparison();

  if (comparison.isLoading) {
    return (
      <PageShell title="Create Comparison" subtitle="Set up the purchase and the requirements suppliers must meet.">
        <Panel>
          <Skeleton className="h-40 w-full" />
        </Panel>
      </PageShell>
    );
  }

  return (
    <CreateForm
      key={comparison.data?.updatedAt ?? "new"}
      comparison={comparison.data ?? null}
    />
  );
}

type FormErrors = {
  productName?: string;
  quantity?: string;
  targetBudget?: string;
  maxLeadTimeDays?: string;
};

function CreateForm({ comparison }: { comparison: Comparison | null }) {
  const navigate = useNavigate();
  const updateComparison = useUpdateComparison();
  const [productName, setProductName] = useState(comparison?.productName ?? "");
  const [quantity, setQuantity] = useState(
    comparison ? String(comparison.requestedQuantity) : "1000",
  );
  const [targetBudget, setTargetBudget] = useState(
    comparison?.targetBudget != null ? String(comparison.targetBudget) : "",
  );
  const [maxLeadTimeDays, setMaxLeadTimeDays] = useState(
    comparison?.maxLeadTimeDays != null ? String(comparison.maxLeadTimeDays) : "",
  );
  const [priority, setPriority] = useState<Priority>(comparison?.priority ?? "balanced");
  const [errors, setErrors] = useState<FormErrors>({});
  const [formMessage, setFormMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = productName.trim();
    const parsedQuantity = Number(quantity);
    const trimmedBudget = targetBudget.trim();
    const parsedBudget = Number(trimmedBudget);
    const trimmedLeadTime = maxLeadTimeDays.trim();
    const parsedLeadTime = Number(trimmedLeadTime);
    const nextErrors: FormErrors = {};

    if (!trimmedName) nextErrors.productName = "Product name cannot be empty.";
    if (!quantity.trim() || !Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      nextErrors.quantity = "Please enter a valid requested quantity.";
    }
    if (trimmedBudget && (!Number.isFinite(parsedBudget) || parsedBudget < 0)) {
      nextErrors.targetBudget = "Budget must be 0 or more, or left empty.";
    }
    if (
      trimmedLeadTime &&
      (!Number.isInteger(parsedLeadTime) || parsedLeadTime < 0)
    ) {
      nextErrors.maxLeadTimeDays = "Lead time must be a whole number of days, or left empty.";
    }

    setErrors(nextErrors);
    setFormMessage(Object.keys(nextErrors).length > 0 ? "Please fix the highlighted fields." : null);
    if (Object.keys(nextErrors).length > 0) return;

    updateComparison.mutate({
      productName: trimmedName,
      requestedQuantity: parsedQuantity,
      targetBudget: trimmedBudget ? parsedBudget : null,
      maxLeadTimeDays: trimmedLeadTime ? parsedLeadTime : null,
      priority,
    });
    navigate("/dashboard");
  }

  return (
    <PageShell title="Create Comparison" subtitle="Set up the purchase and the requirements suppliers must meet.">
      <Panel className="max-w-4xl md:p-10">
        <form className="flex flex-col gap-8" onSubmit={handleSubmit} noValidate>
          {formMessage ? <Notice tone="error">{formMessage}</Notice> : null}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2 md:col-span-2">
              <Label htmlFor="product-name">Product Name</Label>
              <Input
                id="product-name"
                type="text"
                placeholder="e.g. Hand Soap"
                value={productName}
                aria-invalid={Boolean(errors.productName)}
                aria-describedby={errors.productName ? "product-name-error" : undefined}
                onChange={(event) => setProductName(event.target.value)}
                className="h-11"
              />
              {errors.productName ? (
                <p id="product-name-error" className="text-sm text-danger">
                  {errors.productName}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="requested-quantity">Requested Quantity</Label>
              <Input
                id="requested-quantity"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                placeholder="1000"
                value={quantity}
                aria-invalid={Boolean(errors.quantity)}
                aria-describedby={errors.quantity ? "quantity-error" : undefined}
                onChange={(event) => setQuantity(event.target.value)}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">Units you plan to buy.</p>
              {errors.quantity ? (
                <p id="quantity-error" className="text-sm text-danger">
                  {errors.quantity}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="target-budget">Target Budget (SAR)</Label>
              <Input
                id="target-budget"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                placeholder="Optional"
                value={targetBudget}
                aria-invalid={Boolean(errors.targetBudget)}
                aria-describedby={errors.targetBudget ? "target-budget-error" : undefined}
                onChange={(event) => setTargetBudget(event.target.value)}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">Total spend you are willing to approve.</p>
              {errors.targetBudget ? (
                <p id="target-budget-error" className="text-sm text-danger">
                  {errors.targetBudget}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="max-lead-time">Maximum Lead Time (Days)</Label>
              <Input
                id="max-lead-time"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                placeholder="Optional"
                value={maxLeadTimeDays}
                aria-invalid={Boolean(errors.maxLeadTimeDays)}
                aria-describedby={errors.maxLeadTimeDays ? "max-lead-time-error" : undefined}
                onChange={(event) => setMaxLeadTimeDays(event.target.value)}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">Longest delivery you can accept.</p>
              {errors.maxLeadTimeDays ? (
                <p id="max-lead-time-error" className="text-sm text-danger">
                  {errors.maxLeadTimeDays}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <span className="text-sm font-medium text-navy">Priority Strategy</span>
              <PriorityControl value={priority} onChange={setPriority} />
              <p className="text-xs text-muted-foreground">
                Decides how suppliers are ranked on the dashboard and report.
              </p>
            </div>
          </div>

          <div>
            <Button type="submit" className="h-11 w-full px-6 sm:w-auto">
              Create
            </Button>
          </div>
        </form>
      </Panel>
    </PageShell>
  );
}
