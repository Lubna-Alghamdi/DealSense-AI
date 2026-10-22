export type Priority = "lowest_cost" | "fastest" | "balanced";

export interface Supplier {
  id: string;
  name: string;
  unitPrice: number;
  moq: number;
  shippingCost: number;
  leadTimeDays: number;
  createdAt: string;
}

export interface CalculatedSupplier extends Supplier {
  orderQuantity: number;
  productCost: number;
  totalCost: number;
  costPerUnit: number;
  extraUnits: number;
  extraPurchaseCost: number;
  costScore: number;
  deliveryScore: number;
  balancedScore: number;
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  lowest_cost: "Lowest Cost",
  fastest: "Fastest Delivery",
  balanced: "Balanced (50% cost / 50% delivery)",
};

export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "lowest_cost", label: "Lowest Cost" },
  { value: "fastest", label: "Fastest Delivery" },
  { value: "balanced", label: "Balanced" },
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});
const unitFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const scoreFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const quantityFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return `SAR ${currencyFormatter.format(value)}`;
}

export function formatUnitCost(value: number): string {
  return `SAR ${unitFormatter.format(value)}`;
}

export function formatScore(value: number): string {
  return scoreFormatter.format(value);
}

export function formatQuantity(value: number): string {
  return quantityFormatter.format(value);
}

export function formatLeadTime(days: number): string {
  return `${days} ${days === 1 ? "day" : "days"}`;
}

export function calculateSupplier(
  supplier: Supplier,
  requestedQuantity: number,
): Omit<CalculatedSupplier, "costScore" | "deliveryScore" | "balancedScore"> {
  const orderQuantity = Math.max(requestedQuantity, supplier.moq);
  const productCost = orderQuantity * supplier.unitPrice;
  const totalCost = productCost + supplier.shippingCost;
  const extraUnits = Math.max(0, supplier.moq - requestedQuantity);
  return {
    ...supplier,
    orderQuantity,
    productCost,
    totalCost,
    costPerUnit: totalCost / orderQuantity,
    extraUnits,
    extraPurchaseCost: extraUnits * supplier.unitPrice,
  };
}

export function calculateCostScore(
  totalCost: number,
  minimumTotalCost: number,
  maximumTotalCost: number,
): number {
  if (maximumTotalCost === minimumTotalCost) return 100;
  return (
    (100 * (maximumTotalCost - totalCost)) /
    (maximumTotalCost - minimumTotalCost)
  );
}

export function calculateDeliveryScore(
  leadTimeDays: number,
  minimumLeadTime: number,
  maximumLeadTime: number,
): number {
  if (maximumLeadTime === minimumLeadTime) return 100;
  return (
    (100 * (maximumLeadTime - leadTimeDays)) /
    (maximumLeadTime - minimumLeadTime)
  );
}

export function calculateBalancedScore(costScore: number, deliveryScore: number): number {
  const score = 0.5 * costScore + 0.5 * deliveryScore;
  return Math.round(score * 100) / 100;
}

export function calculateAllSuppliers(
  suppliers: Supplier[],
  requestedQuantity: number,
): CalculatedSupplier[] {
  const calculated = suppliers.map((supplier) =>
    calculateSupplier(supplier, requestedQuantity),
  );
  if (calculated.length === 0) return [];

  const totals = calculated.map((row) => row.totalCost);
  const leadTimes = calculated.map((row) => row.leadTimeDays);
  const minTotal = Math.min(...totals);
  const maxTotal = Math.max(...totals);
  const minLead = Math.min(...leadTimes);
  const maxLead = Math.max(...leadTimes);

  return calculated.map((row) => {
    const costScore = calculateCostScore(row.totalCost, minTotal, maxTotal);
    const deliveryScore = calculateDeliveryScore(row.leadTimeDays, minLead, maxLead);
    return {
      ...row,
      costScore,
      deliveryScore,
      balancedScore: calculateBalancedScore(costScore, deliveryScore),
    };
  });
}

function compareByName(a: CalculatedSupplier, b: CalculatedSupplier): number {
  return a.name.localeCompare(b.name);
}

export function rankSuppliers(
  suppliers: CalculatedSupplier[],
  priority: Priority,
): CalculatedSupplier[] {
  const comparators: Record<
    Priority,
    (a: CalculatedSupplier, b: CalculatedSupplier) => number
  > = {
    lowest_cost: (a, b) =>
      a.totalCost - b.totalCost ||
      a.leadTimeDays - b.leadTimeDays ||
      compareByName(a, b),
    fastest: (a, b) =>
      a.leadTimeDays - b.leadTimeDays ||
      a.totalCost - b.totalCost ||
      compareByName(a, b),
    balanced: (a, b) =>
      b.balancedScore - a.balancedScore ||
      a.totalCost - b.totalCost ||
      a.leadTimeDays - b.leadTimeDays ||
      compareByName(a, b),
  };
  return [...suppliers].sort(comparators[priority]);
}

export function getLowestCostSupplier(
  suppliers: CalculatedSupplier[],
): CalculatedSupplier | undefined {
  return rankSuppliers(suppliers, "lowest_cost")[0];
}

export function getFastestSupplier(
  suppliers: CalculatedSupplier[],
): CalculatedSupplier | undefined {
  return rankSuppliers(suppliers, "fastest")[0];
}

export function getBalancedSupplier(
  suppliers: CalculatedSupplier[],
): CalculatedSupplier | undefined {
  return rankSuppliers(suppliers, "balanced")[0];
}

export function getRecommendedSupplier(
  suppliers: CalculatedSupplier[],
  priority: Priority,
): CalculatedSupplier | undefined {
  return rankSuppliers(suppliers, priority)[0];
}
