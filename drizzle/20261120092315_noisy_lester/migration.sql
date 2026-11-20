CREATE TABLE "organization_help_topics" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "organization_help_topics_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"organizatonId" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_profile" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "organization_profile_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"website" text,
	"about" text,
	"contact1" text,
	"contact2" text,
	"addressLine1" text,
	"addressLine2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"country" text NOT NULL,
	"organizatonId" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_socialmedia" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "organization_socialmedia_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"instagram" text,
	"facebook" text,
	"youtube" text,
	"twitter" text,
	"linkedin" text,
	"organization_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_support_hours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organizationId" integer NOT NULL,
	"day_of_week" integer NOT NULL,
	"is_open" boolean DEFAULT true NOT NULL,
	"opening_time" time,
	"closing_time" time,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"timezone" varchar(100) DEFAULT 'Asia/Kolkata' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "description" varchar;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "industry" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "image_id" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "is_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "ticket_assignments" ALTER COLUMN "member_id" SET DATA TYPE integer USING "member_id"::integer;--> statement-breakpoint
ALTER TABLE "organization_help_topics" ADD CONSTRAINT "organization_help_topics_organizatonId_organization_id_fkey" FOREIGN KEY ("organizatonId") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "organization_profile" ADD CONSTRAINT "organization_profile_organizatonId_organization_id_fkey" FOREIGN KEY ("organizatonId") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "organization_socialmedia" ADD CONSTRAINT "organization_socialmedia_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "organization_support_hours" ADD CONSTRAINT "organization_support_hours_organizationId_organization_id_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE;