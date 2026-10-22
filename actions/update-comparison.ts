import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { comparisonIdFor, currentOwnerEmail } from "../server/owner.js";

export default defineAction({
  description:
    "Update the current comparison's product name, requested quantity, priority, target budget, and/or maximum lead time.",
  schema: z.object({
    productName: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .optional()
      .describe("Product name, for example 'Hand Soap'"),
    requestedQuantity: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe("Requested quantity as a positive whole number of units"),
    priority: z
      .enum(["lowest_cost", "fastest", "balanced"])
      .optional()
      .describe("Priority strategy: lowest_cost, fastest, or balanced"),
    targetBudget: z
      .number()
      .min(0)
      .nullable()
      .optional()
      .describe("Target total budget in SAR, or null to clear"),
    maxLeadTimeDays: z
      .number()
      .int()
      .min(0)
      .nullable()
      .optional()
      .describe("Maximum acceptable lead time in days, or null to clear"),
  }),
  run: async (input) => {
    const db = getDb();
    const owner = currentOwnerEmail();
    const patch = {
      ...input,
      updatedAt: new Date().toISOString(),
    };
    const [row] = await db
      .insert(schema.comparisons)
      .values({ id: comparisonIdFor(owner), ownerEmail: owner, ...patch })
      .onConflictDoUpdate({ target: schema.comparisons.id, set: patch })
      .returning();
    return row;
  },
});
