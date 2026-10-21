CREATE TYPE "user_role" AS ENUM('admin', 'agent', 'customer');--> statement-breakpoint
CREATE TABLE "issueagents" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "issueagents_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"issue" integer,
	"agent" integer,
	CONSTRAINT "issue_agent_unique" UNIQUE("issue","agent")
);
--> statement-breakpoint
CREATE TABLE "issue" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "issue_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"ticket" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ticket_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL,
	"description" varchar NOT NULL,
	"images" varchar[],
	"user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL,
	"email" varchar NOT NULL UNIQUE,
	"password" varchar NOT NULL,
	"googleId" varchar UNIQUE,
	"role" "user_role" DEFAULT 'customer'::"user_role" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "issueagents" ADD CONSTRAINT "issueagents_issue_issue_id_fkey" FOREIGN KEY ("issue") REFERENCES "issue"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "issueagents" ADD CONSTRAINT "issueagents_agent_users_id_fkey" FOREIGN KEY ("agent") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "issue" ADD CONSTRAINT "issue_ticket_ticket_id_fkey" FOREIGN KEY ("ticket") REFERENCES "ticket"("id");--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;