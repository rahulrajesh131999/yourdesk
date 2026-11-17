CREATE TABLE "ticket_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"ticketId" integer NOT NULL CONSTRAINT "unique_ticket_feedback" UNIQUE,
	"organizationId" integer NOT NULL,
	"customerId" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ticket_image" ADD COLUMN "public_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket_assignments" ALTER COLUMN "member_id" SET DATA TYPE integer USING "member_id"::integer;--> statement-breakpoint
ALTER TABLE "ticket_feedback" ADD CONSTRAINT "ticket_feedback_ticketId_ticket_id_fkey" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ticket_feedback" ADD CONSTRAINT "ticket_feedback_organizationId_organization_id_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ticket_feedback" ADD CONSTRAINT "ticket_feedback_customerId_user_id_fkey" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE CASCADE;