import { useMemo } from "react";

import { useComparison, useSuppliers } from "@/hooks/use-deal-data";
import { calculateAllSuppliers, type Priority } from "@/lib/comparison";

export function useComparisonResults() {
  const comparison = useComparison();
  const suppliers = useSuppliers();
  const requestedQuantity = comparison.data?.requestedQuantity ?? 1000;
  const priority: Priority = comparison.data?.priority ?? "balanced";

  const calculated = useMemo(
    () => calculateAllSuppliers(suppliers.data ?? [], requestedQuantity),
    [suppliers.data, requestedQuantity],
  );

  return {
    productName: comparison.data?.productName ?? "",
    requestedQuantity,
    priority,
    calculated,
  };
}
