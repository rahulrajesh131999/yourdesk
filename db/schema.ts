import {
  integer,
  text,
  boolean,
  pgTable,
  varchar,
  pgEnum,
  unique,
  timestamp
} from "drizzle-orm/pg-core";
import { defineRelations } from "drizzle-orm";

export const organizationRoles = pgEnum("user_role", ["admin", "agent", "customer"]);
export const ticketStatus = pgEnum("ticket_status", ["open", "pending", "resolved", "closed"])
export const ticketPriority = pgEnum("ticket_priority", ["low", "medium", "high", "urgent"])

export const UserTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar().notNull(),
  email: varchar().notNull().unique(),
  password: varchar(),
  googleId: varchar().unique(),
  emailVerified : boolean(),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow(),
});

export const OrganizationTable = pgTable("organization",{
  id : integer().primaryKey().generatedAlwaysAsIdentity(),
  name : varchar().notNull(),
  slug : varchar().notNull().unique(),
  createdBy : integer("user_id").notNull().references(()=>UserTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  
})

export const OrganizationMembersTable = pgTable("organization_members",{
  id : integer().primaryKey().generatedAlwaysAsIdentity(),
  organizationId : integer("organization_id").notNull().references(()=>OrganizationTable.id,{
    onDelete : "cascade"
  }),

  userId : integer("user_id").notNull().references(()=>UserTable.id,{
    onDelete : "cascade"
  }),
  role : organizationRoles().notNull().default("agent"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  
},
(table)=> [
  unique("organization_user_unique").on(
    table.organizationId,
    table.userId
  )
])

export const TicketTable = pgTable("ticket", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar().notNull(),
  description: varchar().notNull(),
  images: varchar().array(),
  userId: integer("user_id")
    .notNull()
    .references(() => UserTable.id, {
      onDelete: "cascade",
    }),

  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow(),
});

export const IssuesTable = pgTable("issue", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  // agents: integer("user_id").array().references(() => UserTable.id),
  ticket: integer()
    .notNull()
    .references(() => TicketTable.id),

  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow(),
});

export const IssueAgents = pgTable("issueagents", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  issue: integer().references(() => IssuesTable.id, {
    onDelete : "cascade"
  }),
  agent: integer().references(() => UserTable.id,{
    onDelete : "cascade"
  }),

  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow(),
  
},
(table) => [
    // prevent assigning the same agent to the same issue twice
    unique("issue_agent_unique").on(table.issue, table.agent)
]
);

export const relations = defineRelations(
  { UserTable, TicketTable, IssuesTable, IssueAgents },
  (r) => ({
    // User can create many tickets
    UserTable: {
      tickets: r.many.TicketTable({
        from: r.UserTable.id,
        to: r.TicketTable.userId,
      }),
      assignAgets: r.many.IssueAgents({
        from: r.UserTable.id,
        to: r.IssueAgents.agent,
      }),
    },

    // Each ticket belongs to one user and have many issues
    TicketTable: {
      user: r.one.UserTable({
        from: r.TicketTable.userId,
        to: r.UserTable.id,
      }),
      issues: r.many.IssuesTable({
        from: r.TicketTable.id,
        to: r.IssuesTable.ticket,
      }),
    },

    IssuesTable: {
      ticketDetails : r.one.TicketTable({
        from: r.IssuesTable.ticket,
        to: r.TicketTable.id,
      }),
      assignments: r.many.IssueAgents({
        from: r.IssuesTable.id,
        to: r.IssueAgents.issue,
      }),
    },

    IssueAgents: {
      issueDetails : r.one.IssuesTable({
        from: r.IssueAgents.issue,
        to: r.IssuesTable.id,
      }),

      agentDetails : r.one.UserTable({
        from: r.IssueAgents.agent,
        to: r.UserTable.id,
      }),
    },
  }),
);
