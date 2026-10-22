import {
  formatCurrency,
  formatLeadTime,
  formatQuantity,
  PRIORITY_LABELS,
  type Priority,
} from "@/lib/comparison";

export interface AssumptionRow {
  name: string;
  orderQuantity: number;
  extraUnits: number;
  totalCost: number;
  leadTimeDays: number;
}

export interface AssumptionInput {
  productName: string;
  requestedQuantity: number;
  priority: Priority;
  recommended: AssumptionRow | undefined;
  rows: AssumptionRow[];
}

export function buildReportAssumptions({
  productName,
  requestedQuantity,
  priority,
  recommended,
  rows,
}: AssumptionInput): string[] {
  const assumptions = [
    `${formatQuantity(requestedQuantity)} units of ${productName} are assumed to be purchased, so each supplier is priced at that quantity or its MOQ, whichever is larger.`,
  ];

  const cheapest = minBy(rows, (row) => row.totalCost);
  const fastest = minBy(rows, (row) => row.leadTimeDays);
  const withExtra = rows.filter((row) => row.extraUnits > 0);

  if (recommended && cheapest) {
    if (cheapest.name === recommended.name) {
      assumptions.push(
        `${recommended.name} is also the lowest-cost quote, so the ${PRIORITY_LABELS[priority].toLowerCase()} priority involves no cost trade-off.`,
      );
    } else {
      const premium = recommended.totalCost - cheapest.totalCost;
      assumptions.push(
        `${cheapest.name} has the lowest total cost at ${formatCurrency(cheapest.totalCost)}. ${recommended.name} costs ${formatCurrency(premium)} more, and the recommendation assumes its delivery terms justify that difference under the ${PRIORITY_LABELS[priority].toLowerCase()} priority.`,
      );
    }
  }

  if (recommended && fastest) {
    if (fastest.leadTimeDays < recommended.leadTimeDays) {
      assumptions.push(
        `${fastest.name} delivers fastest in ${formatLeadTime(fastest.leadTimeDays)}, compared with ${formatLeadTime(recommended.leadTimeDays)} for ${recommended.name}.`,
      );
    } else {
      assumptions.push(
        `${recommended.name} also has the shortest lead time at ${formatLeadTime(recommended.leadTimeDays)}.`,
      );
    }
  }

  if (withExtra.length > 0) {
    const details = withExtra
      .map((row) => `${row.name} (${formatQuantity(row.extraUnits)} extra)`)
      .join(", ");
    assumptions.push(
      `The MOQ forces extra purchases: ${details}. These extra units are paid for and included in total cost.`,
    );
  } else if (rows.length > 0) {
    assumptions.push(
      "No supplier's MOQ exceeds the requested quantity, so no extra units are added to any quote.",
    );
  }

  assumptions.push(
    "Costs include only the unit price, shipping, and MOQ-adjusted quantity entered for each supplier. Taxes, customs, currency conversion, and quality checks are excluded.",
  );

  return assumptions;
}

function minBy<T>(items: T[], score: (item: T) => number): T | undefined {
  return items.reduce<T | undefined>(
    (best, item) => (best === undefined || score(item) < score(best) ? item : best),
    undefined,
  );
}
