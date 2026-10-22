import { defineAction } from "@agent-native/core/action";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { currentOwnerEmail } from "../server/owner.js";

export default defineAction({
  description: "List all suppliers in the current comparison, oldest first.",
  schema: z.object({}),
  http: { method: "GET" },
  readOnly: true,
  run: async () => {
    const db = getDb();
    const owner = currentOwnerEmail();
    return db
      .select()
      .from(schema.suppliers)
      .where(eq(schema.suppliers.ownerEmail, owner))
      .orderBy(asc(schema.suppliers.createdAt));
  },
});
