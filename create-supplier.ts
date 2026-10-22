import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { currentOwnerEmail } from "../server/owner.js";

export default defineAction({
  description: "Add a supplier quotation to the comparison.",
  schema: z.object({
    name: z.string().trim().min(1).max(120).describe("Supplier name"),
    unitPrice: z.number().min(0).describe("Unit price in SAR per unit"),
    moq: z.number().int().min(1).describe("Minimum order quantity in units"),
    shippingCost: z.number().min(0).describe("Shipping cost in SAR"),
    leadTimeDays: z.number().int().min(0).describe("Lead time in days"),
  }),
  run: async (input) => {
    const db = getDb();
    const owner = currentOwnerEmail();
    const [row] = await db
      .insert(schema.suppliers)
      .values({
        id: crypto.randomUUID(),
        ownerEmail: owner,
        ...input,
        createdAt: new Date().toISOString(),
      })
      .returning();
    return row;
  },
});
