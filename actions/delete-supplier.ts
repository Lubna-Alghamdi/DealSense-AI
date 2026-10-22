import { defineAction, fail } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { currentOwnerEmail } from "../server/owner.js";

export default defineAction({
  description: "Delete a supplier by id.",
  schema: z.object({
    id: z.string().describe("Supplier id"),
  }),
  run: async ({ id }) => {
    const db = getDb();
    const owner = currentOwnerEmail();
    const [row] = await db
      .delete(schema.suppliers)
      .where(and(eq(schema.suppliers.id, id), eq(schema.suppliers.ownerEmail, owner)))
      .returning();
    if (!row) fail("Supplier not found", { statusCode: 404 });
    return row;
  },
});
