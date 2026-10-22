import { IconPencil, IconPlus, IconTrash, IconUpload } from "@tabler/icons-react";
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { LinkButton, Notice, PageShell, Panel, TableSkeleton } from "@/components/app-ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  useComparison,
  useDeleteSupplier,
  useSuppliers,
  useUpdateSupplier,
} from "@/hooks/use-deal-data";
import { useActionMutation } from "@agent-native/core/client/hooks";
import {
  formatCurrency,
  formatLeadTime,
  formatUnitCost,
  type Supplier,
} from "@/lib/comparison";
import {
  EMPTY_SUPPLIER_FORM,
  parseSupplierRows,
  readSpreadsheetRows,
  validateSupplierForm,
  type SupplierFormErrors,
  type SupplierFormValues,
} from "@/lib/supplier-input";
import { cn } from "@/lib/utils";

const MIN_SUPPLIERS = 2;

export default function SuppliersRoute() {
  const navigate = useNavigate();
  const comparison = useComparison();
  const suppliers = useSuppliers();

  const [mode, setMode] = useState<"manual" | "upload">("manual");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SupplierFormValues>(EMPTY_SUPPLIER_FORM);
  const [errors, setErrors] = useState<SupplierFormErrors>({});
  const [importErrors, setImportErrors] = useState<string[]>([]);

  const list = suppliers.data ?? [];
  const canContinue = list.length >= MIN_SUPPLIERS;
  const requestedQuantity = comparison.data?.requestedQuantity ?? 1000;

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_SUPPLIER_FORM);
    setErrors({});
  }

  function startEdit(supplier: Supplier) {
    setMode("manual");
    setEditingId(supplier.id);
    setErrors({});
    setForm({
      name: supplier.name,
      unitPrice: String(supplier.unitPrice),
      moq: String(supplier.moq),
      shippingCost: String(supplier.shippingCost),
      leadTimeDays: String(supplier.leadTimeDays),
    });
  }

  return (
    <PageShell
      title="Add Suppliers"
      subtitle="Add supplier quotations manually or upload a spreadsheet."
    >
      <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Entry method">
        <ModeButton
          icon={<IconPlus size={22} aria-hidden="true" />}
          title="Add Supplier"
          description="Enter one quotation at a time with a form."
          active={mode === "manual"}
          onClick={() => setMode("manual")}
        />
        <ModeButton
          icon={<IconUpload size={22} aria-hidden="true" />}
          title="Upload Spreadsheet"
          description="Import many quotations from an .xlsx or .csv file."
          active={mode === "upload"}
          onClick={() => setMode("upload")}
        />
      </div>

      {mode === "manual" ? (
        <ManualForm
          key={editingId ?? "new"}
          editingSupplier={list.find((row) => row.id === editingId) ?? null}
          requestedQuantity={requestedQuantity}
          form={form}
          setForm={setForm}
          errors={errors}
          setErrors={setErrors}
          onDone={resetForm}
          isEditing={editingId !== null}
        />
      ) : (
        <UploadPanel
          onImported={() => setImportErrors([])}
          errors={importErrors}
          setErrors={setImportErrors}
        />
      )}

      <Panel className="flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-semibold text-navy">Supplier quotations</h2>
          <p className="text-sm text-muted-foreground">
            {list.length} {list.length === 1 ? "supplier" : "suppliers"} added
          </p>
        </div>

        {suppliers.isLoading ? (
          <TableSkeleton />
        ) : list.length === 0 ? (
          <Notice tone="info">No suppliers yet. Add at least {MIN_SUPPLIERS} to continue.</Notice>
        ) : (
          <SupplierTable suppliers={list} onEdit={startEdit} />
        )}
      </Panel>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        {!canContinue && !suppliers.isLoading ? (
          <p className="text-sm text-muted-foreground sm:mr-auto">
            Add at least {MIN_SUPPLIERS} suppliers to continue.
          </p>
        ) : null}
        <Button
          type="button"
          className="h-11 px-6"
          disabled={!canContinue}
          onClick={() => navigate("/dashboard")}
        >
          Continue to Dashboard
        </Button>
      </div>
    </PageShell>
  );
}

function ModeButton({
  icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 rounded-2xl border p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary bg-primary/10 text-foreground shadow-md shadow-primary/10"
          : "border-border bg-card/60 text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "inline-flex size-11 shrink-0 items-center justify-center rounded-xl",
          active ? "bg-primary text-primary-foreground" : "bg-secondary text-primary",
        )}
      >
        {icon}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-base font-semibold text-foreground">{title}</span>
        <span className="text-sm text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}

function ManualForm({
  editingSupplier,
  requestedQuantity,
  form,
  setForm,
  errors,
  setErrors,
  onDone,
  isEditing,
}: {
  editingSupplier: Supplier | null;
  requestedQuantity: number;
  form: SupplierFormValues;
  setForm: (next: SupplierFormValues) => void;
  errors: SupplierFormErrors;
  setErrors: (next: SupplierFormErrors) => void;
  onDone: () => void;
  isEditing: boolean;
}) {
  const createSupplier = useActionMutation("create-supplier");
  const updateSupplier = useUpdateSupplier();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isEditing) return;
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    formRef.current?.querySelector("input")?.focus();
  }, [isEditing]);

  function update(field: keyof SupplierFormValues, value: string) {
    setForm({ ...form, [field]: value });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateSupplierForm(form);
    setErrors(result.errors);
    if (!result.data) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    const data = result.data;

    if (editingSupplier) {
      updateSupplier.mutate({ id: editingSupplier.id, ...data });
      toast.success("Supplier updated.");
    } else {
      createSupplier.mutate(data, {
        onSuccess: () => toast.success("Supplier added successfully."),
        onError: () => toast.error("Could not add the supplier."),
      });
    }
    if (data.moq > requestedQuantity) {
      toast.warning(`MOQ is higher than requested quantity. ${data.moq - requestedQuantity} extra units will be bought.`);
    }
    onDone();
  }

  const fields: { key: keyof SupplierFormValues; label: string; type: string; step?: string; min: string; placeholder: string }[] = [
    { key: "name", label: "Supplier Name", type: "text", min: "", placeholder: "e.g. Supplier F" },
    { key: "unitPrice", label: "Unit Price (SAR)", type: "number", step: "0.01", min: "0", placeholder: "8.50" },
    { key: "moq", label: "MOQ", type: "number", step: "1", min: "1", placeholder: "1000" },
    { key: "shippingCost", label: "Shipping Cost (SAR)", type: "number", step: "0.01", min: "0", placeholder: "2500" },
    { key: "leadTimeDays", label: "Lead Time (Days)", type: "number", step: "1", min: "0", placeholder: "21" },
  ];

  return (
    <Panel>
      <form ref={formRef} className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-navy">
            {isEditing ? `Edit ${editingSupplier?.name ?? "supplier"}` : "Manual supplier entry"}
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => {
            const id = `supplier-${field.key}`;
            const error = errors[field.key];
            return (
              <div key={field.key} className="flex flex-col gap-2">
                <Label htmlFor={id}>{field.label}</Label>
                <Input
                  id={id}
                  type={field.type}
                  step={field.step}
                  min={field.min || undefined}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${id}-error` : undefined}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => update(field.key, event.target.value)}
                  className="h-11"
                />
                {error ? (
                  <p id={`${id}-error`} className="text-sm text-danger">
                    {error}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" className="h-11 px-6">
            {isEditing ? "Save Changes" : "Add Supplier"}
          </Button>
          {isEditing ? (
            <Button type="button" variant="outline" className="h-11 px-6" onClick={onDone}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    </Panel>
  );
}

function UploadPanel({
  errors,
  setErrors,
  onImported,
}: {
  errors: string[];
  setErrors: (next: string[]) => void;
  onImported: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const importSuppliers = useActionMutation("import-suppliers", {
    onError: () => toast.error("Could not save the imported suppliers."),
  });

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".xlsx") && !lower.endsWith(".csv")) {
      setErrors(["Only .xlsx and .csv files are supported."]);
      toast.error("Invalid spreadsheet format.");
      return;
    }

    setBusy(true);
    try {
      const rows = await readSpreadsheetRows(file);
      const result = parseSupplierRows(rows);
      if (result.errors.length > 0) {
        setErrors(result.errors);
        toast.error("Invalid spreadsheet format.");
        return;
      }
      await importSuppliers.mutateAsync({ suppliers: result.suppliers });
      setErrors([]);
      onImported();
      toast.success("Spreadsheet imported successfully.");
    } catch {
      setErrors(["The file could not be read. Check that it is a valid .xlsx or .csv file."]);
      toast.error("Invalid spreadsheet format.");
    } finally {
      setBusy(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    void handleFile(event.dataTransfer.files[0]);
  }

  return (
    <Panel className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-navy">Upload supplier quotation file</h2>
        <p className="text-sm text-muted-foreground">
          Expected headers: Supplier Name, Unit Price (SAR), MOQ, Shipping Cost (SAR), Lead Time (Days).
        </p>
      </div>
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors focus-within:ring-2 focus-within:ring-ring",
          dragging ? "border-primary bg-secondary" : "border-border hover:bg-secondary/60",
        )}
      >
        <IconUpload size={28} className="text-primary" aria-hidden="true" />
        <span className="text-sm font-semibold text-navy">
          {busy ? "Importing..." : "Upload supplier quotation file"}
        </span>
        <span className="text-xs text-muted-foreground">Drag a file here or click to choose (.xlsx or .csv)</span>
        <input
          type="file"
          accept=".xlsx,.csv"
          className="sr-only"
          aria-label="Upload supplier quotation file"
          disabled={busy}
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </label>
      {errors.length > 0 ? (
        <Notice tone="error">
          <span>Invalid spreadsheet format. Nothing was imported.</span>
          <ul className="list-disc pl-5 font-normal">
            {errors.slice(0, 10).map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
          {errors.length > 10 ? <span className="font-normal">And {errors.length - 10} more.</span> : null}
        </Notice>
      ) : null}
    </Panel>
  );
}

function SupplierTable({
  suppliers,
  onEdit,
}: {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
}) {
  const deleteSupplier = useDeleteSupplier();

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <Table className="min-w-[640px]">
        <TableHeader className="bg-secondary/60">
          <TableRow>
            <TableHead>Supplier</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>MOQ</TableHead>
            <TableHead>Shipping</TableHead>
            <TableHead>Lead Time</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell className="font-medium text-navy">{supplier.name}</TableCell>
              <TableCell>{formatUnitCost(supplier.unitPrice)}</TableCell>
              <TableCell>{supplier.moq.toLocaleString("en-US")}</TableCell>
              <TableCell>{formatCurrency(supplier.shippingCost)}</TableCell>
              <TableCell>{formatLeadTime(supplier.leadTimeDays)}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Edit ${supplier.name}`}
                    onClick={() => onEdit(supplier)}
                  >
                    <IconPencil size={16} aria-hidden="true" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" aria-label={`Delete ${supplier.name}`}>
                        <IconTrash size={16} aria-hidden="true" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove {supplier.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This quotation will be removed from the comparison.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            deleteSupplier.mutate({ id: supplier.id });
                            toast.success("Supplier removed.");
                          }}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
