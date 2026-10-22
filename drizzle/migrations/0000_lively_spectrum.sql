CREATE TABLE "comparisons" (
	"id" text PRIMARY KEY NOT NULL,
	"product_name" text DEFAULT '' NOT NULL,
	"requested_quantity" integer DEFAULT 1000 NOT NULL,
	"priority" text DEFAULT 'balanced' NOT NULL,
	"updated_at" text DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"unit_price" double precision NOT NULL,
	"moq" integer NOT NULL,
	"shipping_cost" double precision NOT NULL,
	"lead_time_days" integer NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
INSERT INTO "comparisons" ("id", "product_name", "requested_quantity", "priority", "updated_at") VALUES ('current', 'Hand Soap', 1000, 'balanced', '2026-10-20T00:00:00.000Z');
--> statement-breakpoint
INSERT INTO "suppliers" ("id", "name", "unit_price", "moq", "shipping_cost", "lead_time_days", "created_at") VALUES
('sup-seed-a', 'Supplier A', 8.5, 1000, 2500, 35, '2026-10-20T00:00:01.000Z'),
('sup-seed-b', 'Supplier B', 9.2, 500, 1000, 15, '2026-10-20T00:00:02.000Z'),
('sup-seed-c', 'Supplier C', 8.9, 800, 1600, 22, '2026-10-20T00:00:03.000Z'),
('sup-seed-d', 'Supplier D', 8.2, 1500, 1800, 28, '2026-10-20T00:00:04.000Z'),
('sup-seed-e', 'Supplier E', 9.5, 300, 900, 12, '2026-10-20T00:00:05.000Z');
