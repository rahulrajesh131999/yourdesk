import {
  integer,
  text,
  boolean,
  pgTable,
  varchar,
  pgEnum,
  unique,
  timestamp,
  index,
  uuid,
  time,
} from "drizzle-orm/pg-core";
import { defineRelations } from "drizzle-orm";

export const organizationRoles = pgEnum("organization_role", [
  "admin",
  "owner",
  "agent",
]);
export const ticketStatus = pgEnum("ticket_status", [
  "open",
  "pending",
  "resolved",
  "closed",
]);
export const ticketPriority = pgEnum("ticket_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);
export const agentStatus = pgEnum("agentStatus", [
  "open",
  "available",
  "away",
  "offline",
]);

export const ticketKind = pgEnum("ticketKind",[
  "issue",
  "suggestion"
])

export const UserTable = pgTable("user", {
  id: text("id").primaryKey(),
  name: varchar().notNull(),
  email: varchar().notNull().unique(),
  password: varchar(),
  googleId: varchar().unique(),
  emailVerified: boolean(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const OrganizationTable = pgTable("organization", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar().notNull(),
  slug: varchar().notNull().unique(),
  description :varchar(),
  industry: varchar().notNull(),
  image : text("image"),
  image_public_id : text("image_id"),
  is_verified : boolean().default(false),
  createdBy: text("created_by")
    .notNull()
    .references(() => UserTable.id,{
      onDelete:"cascade"
    }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const OrganizationProfile = pgTable("organization_profile",{
  id : integer().primaryKey().generatedAlwaysAsIdentity(),
  website : text(),
  about : text(),
  contact1:text(),
  contact2:text(),
  addressLine1:text(),
  addressLine2:text(),
  city:text().notNull(),
  state : text().notNull(),
  country : text().notNull(),
  organizatonId : integer().notNull().references(()=>OrganizationTable.id,{
    onDelete : "cascade"
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const organizationSupportHours = pgTable(
  "organization_support_hours",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    organizationId: integer()
      .notNull()
      .references(() => OrganizationTable.id,{onDelete : "cascade"}),

    dayOfWeek: integer("day_of_week").notNull(),
    // 0 = Sunday, 1 = Monday ... 6 = Saturday

    isOpen: boolean("is_open").notNull().default(true),

    openingTime: time("opening_time"),
    closingTime: time("closing_time"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
    timezone: varchar("timezone", { length: 100 })
  .notNull()
  .default("Asia/Kolkata"),
  },
);

export const OrganizationHelpTopics = pgTable("organization_help_topics",{
  id : integer().primaryKey().generatedAlwaysAsIdentity(),
  question : text().notNull(),
  answer : text().notNull(),
  organizatonId : integer().notNull().references(()=>OrganizationTable.id,{
    onDelete : "cascade"
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const OrganizationSocialmedia = pgTable("organization_socialmedia",{
  id : integer().primaryKey().generatedAlwaysAsIdentity(),
  instagram : text(),
  facebook : text(),
  youtube : text(),
  twitter : text(),
  linkedin : text(),
  organizationId: integer("organization_id")
    .notNull()
    .references(() => OrganizationTable.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const OrganizationMembersTable = pgTable(
  "organization_members",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id")
      .notNull()
      .references(() => OrganizationTable.id, {
        onDelete: "cascade",
      }),

    userId: text("user_id")
      .notNull()
      .references(() => UserTable.id, {
        onDelete: "cascade",
      }),
    agentAvailable: agentStatus("agent_status").notNull().default("offline"),
    role: organizationRoles().notNull().default("agent"),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    unique("organization_user_unique").on(table.organizationId, table.userId),
    index("org_members_user_idx").on(table.userId)
  ],
);

/* export const RatingTable = pgTable("rating",{
  id : integer().primaryKey().generatedAlwaysAsIdentity(),
  rating : integer().notNull(),
  review : text(),
  reviewUser : text("user_id").notNull().references(()=> UserTable.id,{
    onDelete:"cascade"
  }),
  reviewOrgainzation : text("organization_id").notNull().references(()=> OrganizationTable.id,{
    onDelete:"cascade"
  }),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
}) */

export const TicketTable = pgTable("ticket", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar().notNull(),
  description: text().notNull(),
  contact : text("contact"),
  kind : ticketKind().default("issue").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => UserTable.id, {
      onDelete: "cascade",
    }),

  organizationId: integer("organization_id")
    .notNull()
    .references(() => OrganizationTable.id, {
      onDelete: "cascade",
    }),

  createdAt: timestamp("created_at").notNull().defaultNow(),

  updatedAt: timestamp("updated_at", {withTimezone:true}).notNull().defaultNow().$onUpdate(()=>new Date()),
},
(table)=>[
  index("ticket_user_idx").on(table.userId),
]);

export const TicketImageTable = pgTable("ticket_image", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  url: varchar().notNull(),
  publicId : varchar("public_id").notNull(),

  ticketId: integer("ticket_id")
    .notNull()
    .references(() => TicketTable.id, {
      onDelete: "cascade",
    }),
});

export const TicketAssignmentTables = pgTable(
  "ticket_assignments",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    ticketId: integer("ticket_id")
      .notNull()
      .references(() => TicketTable.id,{
        onDelete : "cascade"
      }),
    memberId: integer("member_id")
      .notNull()
      .references(() => OrganizationMembersTable.id, {
        onDelete: "cascade",
      }),

    assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  },
  (table) => [
    unique("ticket_member_unique").on(table.ticketId, table.memberId),
    index("ticket_assignment_member_idx").on(table.memberId),
  ],
);

export const TicketFeedbackTable = pgTable("ticket_feedback",{
  id : uuid("id").defaultRandom().primaryKey(),
  ticketId : integer().notNull().references(()=>TicketTable.id,{
    onDelete : "cascade"
  }),
  organizationId : integer().notNull().references(()=> OrganizationTable.id,{
    onDelete : "cascade"
  }),
  customerId : text().notNull().references(()=>UserTable.id,{
    onDelete : "cascade"
  }),
  rating: integer("rating").notNull(),

    comment: text("comment"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
},
(table)=>[
  unique("unique_ticket_feedback").on(table.ticketId)
])

export const relations = defineRelations(
  {
    UserTable,
    OrganizationTable,
    OrganizationMembersTable,
    TicketAssignmentTables,
    TicketTable,
    session,
    account,
    verification,
    TicketImageTable,
    TicketFeedbackTable,
    organizationSupportHours,
    OrganizationProfile,
    OrganizationSocialmedia,
    OrganizationHelpTopics
  },
  (r) => ({
    // User can create many tickets
    UserTable: {
      tickets: r.many.TicketTable({
        from: r.UserTable.id,
        to: r.TicketTable.userId,
      }),
      // this is not about a organization, this is about a single user, so can be in different organizations
      // useful if an agent, consultant, or support professional can work with multiple companies.
      organizationmembers: r.many.OrganizationMembersTable({
        from: r.UserTable.id,
        to: r.OrganizationMembersTable.userId,
      }),
      createdOrganizations: r.many.OrganizationTable({
        from: r.UserTable.id,
        to: r.OrganizationTable.createdBy,
      }),
      userSession : r.many.session({
        from : r.UserTable.id,
        to : r.session.userId
      }),
      userAccount : r.many.account({
        from : r.UserTable.id,
        to : r.account.userId
      }),
      userFeedback : r.many.TicketFeedbackTable({
        from :r.UserTable.id,
        to : r.TicketFeedbackTable.customerId
      })
    },

    session : {
      user : r.one.UserTable({
        from : r.session.userId,
        to : r.UserTable.id
      })
    },
    account : {
      user : r.one.UserTable({
        from : r.account.userId,
        to : r.UserTable.id
      })
    },

    // Each ticket belongs to one user each ticket belongs to one ticketassignmenttable
    TicketTable: {
      user: r.one.UserTable({
        from: r.TicketTable.userId,
        to: r.UserTable.id,
      }),
      organization: r.one.OrganizationTable({
        from: r.TicketTable.organizationId,
        to: r.OrganizationTable.id,
      }),
      ticketAssigned: r.many.TicketAssignmentTables({
        from: r.TicketTable.id,
        to: r.TicketAssignmentTables.ticketId,
      }),
      images : r.many.TicketImageTable({
        from : r.TicketTable.id,
        to : r.TicketImageTable.ticketId
      }) ,
      ticketFeedback : r.one.TicketFeedbackTable({
        from : r.TicketTable.id,
        to : r.TicketFeedbackTable.ticketId
      })
    },

    TicketImageTable : {
      ticketTable : r.one.TicketTable({
        from : r.TicketImageTable.ticketId,
        to : r.TicketTable.id
      })
    },

    OrganizationTable: {
      profile : r.one.OrganizationProfile({
        from : r.OrganizationTable.id,
        to : r.OrganizationProfile.organizatonId
      }),
      socialMedia : r.one.OrganizationSocialmedia({
        from : r.OrganizationTable.id,
        to : r.OrganizationSocialmedia.organizationId
      }), 
      organizationMember: r.many.OrganizationMembersTable({
        from: r.OrganizationTable.id,
        to: r.OrganizationMembersTable.organizationId,
      }),
      organizationTicket: r.many.TicketTable({
        from: r.OrganizationTable.id,
        to: r.TicketTable.organizationId,
      }),
      creator: r.one.UserTable({
        from: r.OrganizationTable.createdBy,
        to: r.UserTable.id,
      }),
      organizationFeedback : r.many.TicketFeedbackTable({
        from : r.OrganizationTable.id,
        to : r.TicketFeedbackTable.organizationId
      }),
      helpTopics : r.many.OrganizationHelpTopics({
        from : r.OrganizationTable.id,
        to : r.OrganizationHelpTopics.organizatonId
      }),
      supportHours : r.many.organizationSupportHours({
        from : r.OrganizationTable.id,
        to : r.organizationSupportHours.organizationId
      }),
      
    },

    OrganizationMembersTable: {
      user: r.one.UserTable({
        from: r.OrganizationMembersTable.userId,
        to: r.UserTable.id,
      }),
      organization: r.one.OrganizationTable({
        from: r.OrganizationMembersTable.organizationId,
        to: r.OrganizationTable.id,
      }),
      ticketAssignment: r.many.TicketAssignmentTables({
        from: r.OrganizationMembersTable.id,
        to: r.TicketAssignmentTables.memberId,
      }),
    },

    OrganizationProfile : {
      organization : r.one.OrganizationTable({
        from : r.OrganizationProfile.organizatonId,
        to : r.OrganizationTable.id
      })
    },
    organizationSupportHours:{
      organization : r.one.OrganizationTable({
        from : r.organizationSupportHours.organizationId,
        to : r.OrganizationTable.id
      })
    },
    OrganizationHelpTopics : {
      organization : r.one.OrganizationTable({
        from : r.OrganizationHelpTopics.organizatonId,
        to : r.OrganizationTable.id
      })
    },
    OrganizationSocialmedia : {
      organization : r.one.OrganizationTable({
        from : r.OrganizationSocialmedia.organizationId,
        to : r.OrganizationTable.id
      })
    },

    TicketFeedbackTable : {
      user : r.one.UserTable({
        from : r.TicketFeedbackTable.customerId,
        to : r.UserTable.id
      }),
      organization : r.one.OrganizationTable({
        from : r.TicketFeedbackTable.organizationId,
        to : r.OrganizationTable.id
      }),
      ticket : r.one.TicketTable({
        from : r.TicketFeedbackTable.ticketId,
        to : r.TicketTable.id
      })
    },

    TicketAssignmentTables: {
      ticket: r.one.TicketTable({
        from: r.TicketAssignmentTables.ticketId,
        to: r.TicketTable.id,
      }),

      member: r.one.OrganizationMembersTable({
        from: r.TicketAssignmentTables.memberId,
        to: r.OrganizationMembersTable.id,
      }),
    },
  }),
);

/* --------------------------------------------------------------------------------------------- */

/* export const IssuesTable = pgTable("issue", {
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
); */
