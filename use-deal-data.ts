import {
  actionErrorMessage,
  useActionMutation,
  useActionQuery,
} from "@agent-native/core/client/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Priority, Supplier } from "@/lib/comparison";

export interface Comparison {
  id: string;
  productName: string;
  requestedQuantity: number;
  priority: Priority;
  targetBudget: number | null;
  maxLeadTimeDays: number | null;
  updatedAt: string;
}

interface RollbackContext<T> {
  previous: T | undefined;
}

const COMPARISON_KEY = ["action", "get-comparison", {}] as const;
const SUPPLIERS_KEY = ["action", "list-suppliers", {}] as const;

export function useComparison() {
  return useActionQuery("get-comparison", {}) as {
    data: Comparison | null | undefined;
    isLoading: boolean;
  };
}

export function useSuppliers() {
  return useActionQuery("list-suppliers", {}) as {
    data: Supplier[] | undefined;
    isLoading: boolean;
  };
}

export function useUpdateComparison() {
  const queryClient = useQueryClient();
  return useActionMutation("update-comparison", {
    onMutate: async (patch: Partial<Omit<Comparison, "id" | "updatedAt">>) => {
      await queryClient.cancelQueries({ queryKey: COMPARISON_KEY });
      const previous = queryClient.getQueryData<Comparison | null>(COMPARISON_KEY);
      queryClient.setQueryData(COMPARISON_KEY, (current: Comparison | null | undefined) =>
        current ? { ...current, ...patch } : current,
      );
      return { previous };
    },
    onError: (error, _patch, context) => {
      queryClient.setQueryData(COMPARISON_KEY, (context as RollbackContext<Comparison | null> | undefined)?.previous);
      toast.error(actionErrorMessage(error) ?? "Could not save the comparison.");
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useActionMutation("update-supplier", {
    onMutate: async (variables: Partial<Supplier> & { id: string }) => {
      await queryClient.cancelQueries({ queryKey: SUPPLIERS_KEY });
      const previous = queryClient.getQueryData<Supplier[]>(SUPPLIERS_KEY);
      queryClient.setQueryData<Supplier[]>(SUPPLIERS_KEY, (current) =>
        current?.map((row) => (row.id === variables.id ? { ...row, ...variables } : row)),
      );
      return { previous };
    },
    onError: (error, _variables, context) => {
      queryClient.setQueryData(SUPPLIERS_KEY, (context as RollbackContext<Supplier[]> | undefined)?.previous);
      toast.error(actionErrorMessage(error) ?? "Could not update the supplier.");
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useActionMutation("delete-supplier", {
    onMutate: async (variables: { id: string }) => {
      await queryClient.cancelQueries({ queryKey: SUPPLIERS_KEY });
      const previous = queryClient.getQueryData<Supplier[]>(SUPPLIERS_KEY);
      queryClient.setQueryData<Supplier[]>(SUPPLIERS_KEY, (current) =>
        current?.filter((row) => row.id !== variables.id),
      );
      return { previous };
    },
    onError: (error, _variables, context) => {
      queryClient.setQueryData(SUPPLIERS_KEY, (context as RollbackContext<Supplier[]> | undefined)?.previous);
      toast.error(actionErrorMessage(error) ?? "Could not remove the supplier.");
    },
  });
}
