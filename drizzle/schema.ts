import { sql } from "drizzle-orm";
import { doublePrecision, integer, pgTable, text } from "drizzle-orm/pg-core";

export const comparisons = pgTable("comparisons", {
  id: text("id").primaryKey(),
  ownerEmail: text("owner_email").notNull(),
  productName: text("product_name").notNull().default(""),
  requestedQuantity: integer("requested_quantity").notNull().default(1000),
  priority: text("priority").notNull().default("balanced"),
  targetBudget: doublePrecision("target_budget"),
  maxLeadTimeDays: integer("max_lead_time_days"),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
});

export const suppliers = pgTable("suppliers", {
  id: text("id").primaryKey(),
  ownerEmail: text("owner_email").notNull(),
  name: text("name").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
  moq: integer("moq").notNull(),
  shippingCost: doublePrecision("shipping_cost").notNull(),
  leadTimeDays: integer("lead_time_days").notNull(),
  createdAt: text("created_at").notNull(),
});
