import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { currentOwnerEmail } from "../server/owner.js";

const supplierRow = z.object({
  name: z.string().trim().min(1).max(120),
  unitPrice: z.number().min(0),
  moq: z.number().int().min(1),
  shippingCost: z.number().min(0),
  leadTimeDays: z.number().int().min(0),
});

export default defineAction({
  description:
    "Add many supplier quotations in one transaction, from a validated spreadsheet import.",
  schema: z.object({
    suppliers: z
      .array(supplierRow)
      .min(1)
      .describe("Supplier rows to add, already validated"),
  }),
  run: async ({ suppliers }) => {
    const db = getDb();
    const owner = currentOwnerEmail();
    const base = Date.now();
    const rows = suppliers.map((row, index) => ({
      id: crypto.randomUUID(),
      ownerEmail: owner,
      ...row,
      createdAt: new Date(base + index).toISOString(),
    }));
    return db.transaction(async (tx) => {
      return tx.insert(schema.suppliers).values(rows).returning();
    });
  },
});
