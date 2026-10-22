import { defineAction, fail } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { currentOwnerEmail } from "../server/owner.js";

export default defineAction({
  description:
    "Update a supplier's name, unit price, MOQ, shipping cost, and/or lead time by id.",
  schema: z.object({
    id: z.string().describe("Supplier id"),
    name: z.string().trim().min(1).max(120).optional().describe("Supplier name"),
    unitPrice: z.number().min(0).optional().describe("Unit price in SAR"),
    moq: z.number().int().min(1).optional().describe("MOQ in units"),
    shippingCost: z.number().min(0).optional().describe("Shipping cost in SAR"),
    leadTimeDays: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe("Lead time in days"),
  }),
  run: async ({ id, ...patch }) => {
    const db = getDb();
    const owner = currentOwnerEmail();
    const [row] = await db
      .update(schema.suppliers)
      .set(patch)
      .where(and(eq(schema.suppliers.id, id), eq(schema.suppliers.ownerEmail, owner)))
      .returning();
    if (!row) fail("Supplier not found", { statusCode: 404 });
    return row;
  },
});
