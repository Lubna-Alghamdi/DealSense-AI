import { defineAction } from "@agent-native/core/action";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";
import { comparisonIdFor, currentOwnerEmail } from "../server/owner.js";

export default defineAction({
  description:
    "Get the current comparison: product name, requested quantity, and priority.",
  schema: z.object({}),
  http: { method: "GET" },
  readOnly: true,
  run: async () => {
    const db = getDb();
    const owner = currentOwnerEmail();
    const [row] = await db
      .select()
      .from(schema.comparisons)
      .where(eq(schema.comparisons.id, comparisonIdFor(owner)));
    return row ?? null;
  },
});
