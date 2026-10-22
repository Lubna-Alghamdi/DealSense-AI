ALTER TABLE "comparisons" ADD COLUMN "owner_email" text;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "owner_email" text;--> statement-breakpoint
UPDATE "comparisons" SET "owner_email" = 'dealsense@gmail.com', "id" = 'current:dealsense@gmail.com' WHERE "id" = 'current';--> statement-breakpoint
UPDATE "suppliers" SET "owner_email" = 'dealsense@gmail.com';--> statement-breakpoint
ALTER TABLE "comparisons" ALTER COLUMN "owner_email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "suppliers" ALTER COLUMN "owner_email" SET NOT NULL;
