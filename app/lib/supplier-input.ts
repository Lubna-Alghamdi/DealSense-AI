import * as XLSX from "xlsx";

export interface SupplierInput {
  name: string;
  unitPrice: number;
  moq: number;
  shippingCost: number;
  leadTimeDays: number;
}

export interface SupplierFormValues {
  name: string;
  unitPrice: string;
  moq: string;
  shippingCost: string;
  leadTimeDays: string;
}

export type SupplierFormErrors = Partial<Record<keyof SupplierFormValues, string>>;

export const EMPTY_SUPPLIER_FORM: SupplierFormValues = {
  name: "",
  unitPrice: "",
  moq: "",
  shippingCost: "",
  leadTimeDays: "",
};

const REQUIRED_HEADERS = [
  { key: "name", header: "Supplier Name" },
  { key: "unitPrice", header: "Unit Price (SAR)" },
  { key: "moq", header: "MOQ" },
  { key: "shippingCost", header: "Shipping Cost (SAR)" },
  { key: "leadTimeDays", header: "Lead Time (Days)" },
] as const;

const HEADER_SEARCH_LIMIT = 10;

function parseNumber(raw: string): number | undefined {
  const text = raw.replace(/SAR/gi, "").replace(/[,\s]/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(text)) return undefined;
  return Number(text);
}

export function validateSupplierForm(values: SupplierFormValues): {
  errors: SupplierFormErrors;
  data?: SupplierInput;
} {
  const errors: SupplierFormErrors = {};
  const name = values.name.trim();
  const unitPrice = parseNumber(values.unitPrice);
  const moq = parseNumber(values.moq);
  const shippingCost = parseNumber(values.shippingCost);
  const leadTimeDays = parseNumber(values.leadTimeDays);

  if (!name) errors.name = "Supplier name is required.";
  if (unitPrice === undefined || unitPrice < 0)
    errors.unitPrice = "Unit price must be 0 or more.";
  if (moq === undefined || !Number.isInteger(moq) || moq < 1)
    errors.moq = "MOQ must be a positive whole number.";
  if (shippingCost === undefined || shippingCost < 0)
    errors.shippingCost = "Shipping cost must be 0 or more.";
  if (leadTimeDays === undefined || !Number.isInteger(leadTimeDays) || leadTimeDays < 0)
    errors.leadTimeDays = "Lead time must be a whole number of days, 0 or more.";

  if (Object.keys(errors).length > 0) return { errors };
  return {
    errors,
    data: {
      name,
      unitPrice: unitPrice as number,
      moq: moq as number,
      shippingCost: shippingCost as number,
      leadTimeDays: leadTimeDays as number,
    },
  };
}

function normalizeHeader(value: unknown): string {
  return String(value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

export function parseCsvText(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export async function readSpreadsheetRows(file: File): Promise<unknown[][]> {
  if (file.name.toLowerCase().endsWith(".csv")) {
    return parseCsvText(await file.text());
  }
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!firstSheet) return [];
  return XLSX.utils.sheet_to_json<unknown[]>(firstSheet, {
    header: 1,
    defval: "",
  });
}

export function parseSupplierRows(rows: unknown[][]): {
  suppliers: SupplierInput[];
  errors: string[];
} {
  const headerIndexes = rows
    .slice(0, HEADER_SEARCH_LIMIT)
    .map((row) => {
      const indexes = new Map<string, number>();
      row.forEach((cell, index) => indexes.set(normalizeHeader(cell), index));
      return indexes;
    });
  const headerOffset = headerIndexes.findIndex((indexes) =>
    REQUIRED_HEADERS.every(({ header }) => indexes.has(normalizeHeader(header))),
  );
  if (headerOffset === -1) {
    const firstRowIndexes = headerIndexes[0] ?? new Map<string, number>();
    const missing = REQUIRED_HEADERS.filter(
      ({ header }) => !firstRowIndexes.has(normalizeHeader(header)),
    );
    return {
      suppliers: [],
      errors: missing.map(({ header }) => `Missing required column: ${header}.`),
    };
  }
  const headerIndex = headerIndexes[headerOffset];

  const dataRows: unknown[][] = [];
  for (const row of rows.slice(headerOffset + 1)) {
    if (row.every((cell) => String(cell ?? "").trim() === "")) break;
    dataRows.push(row);
  }
  if (dataRows.length === 0) {
    return { suppliers: [], errors: ["The file is empty. Add at least one supplier row."] };
  }

  const column = (row: unknown[], header: string) =>
    String(row[headerIndex.get(normalizeHeader(header)) as number] ?? "").trim();

  const suppliers: SupplierInput[] = [];
  const errors: string[] = [];

  dataRows.forEach((row, index) => {
    const line = headerOffset + index + 2;
    const name = column(row, "Supplier Name");
    const unitPrice = parseNumber(column(row, "Unit Price (SAR)"));
    const moq = parseNumber(column(row, "MOQ"));
    const shippingCost = parseNumber(column(row, "Shipping Cost (SAR)"));
    const leadTimeDays = parseNumber(column(row, "Lead Time (Days)"));

    if (!name) errors.push(`Row ${line}: supplier name is blank.`);
    if (unitPrice === undefined || unitPrice < 0)
      errors.push(`Row ${line}: unit price must be a number, 0 or more.`);
    if (moq === undefined || !Number.isInteger(moq) || moq < 1)
      errors.push(`Row ${line}: MOQ must be a positive whole number.`);
    if (shippingCost === undefined || shippingCost < 0)
      errors.push(`Row ${line}: shipping cost must be a number, 0 or more.`);
    if (leadTimeDays === undefined || !Number.isInteger(leadTimeDays) || leadTimeDays < 0)
      errors.push(`Row ${line}: lead time must be a whole number of days, 0 or more.`);

    if (
      name &&
      unitPrice !== undefined &&
      unitPrice >= 0 &&
      moq !== undefined &&
      Number.isInteger(moq) &&
      moq >= 1 &&
      shippingCost !== undefined &&
      shippingCost >= 0 &&
      leadTimeDays !== undefined &&
      Number.isInteger(leadTimeDays) &&
      leadTimeDays >= 0
    ) {
      suppliers.push({ name, unitPrice, moq, shippingCost, leadTimeDays });
    }
  });

  return { suppliers: errors.length > 0 ? [] : suppliers, errors };
}
