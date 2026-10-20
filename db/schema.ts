import {integer, text, boolean, pgTable, varchar, pgEnum} from "drizzle-orm/pg-core";
import { defineRelations } from "drizzle-orm";

export const userRoles = pgEnum("user_role", ["admin","agent", "customer"])

export const UserTable = pgTable("users", {
    id : integer().primaryKey().generatedAlwaysAsIdentity(),
    name : varchar().notNull(),
    email: varchar().notNull().unique(),
    password : varchar().notNull(),
    googleId : varchar().unique(),

    role : userRoles().notNull().default("customer")
})

export const TicketTable = pgTable("ticket", {
    id : integer().primaryKey().generatedAlwaysAsIdentity(),
    name : varchar().notNull(),
    description : varchar().notNull(),
    images : varchar().array(),
    userId : integer("user_id").notNull().references(()=>UserTable.id, {
        onDelete : "cascade"
    })
})

export const IssuesTable = pgTable("issue", {
    id : integer().primaryKey().generatedAlwaysAsIdentity(),
    agents : integer("user_id").array().references(()=>UserTable.id),
    ticket : integer().notNull().references(()=>TicketTable.id)
})

export const IssueAgents = pgTable("issueagents",{
    id : integer().primaryKey().generatedAlwaysAsIdentity(),
    issue : integer().references(()=>IssuesTable.id),
    agent : integer().references(()=>UserTable.id)
})

export const relations = defineRelations(
    { UserTable, TicketTable, IssuesTable, IssueAgents },
    (r) => ({
        // User can create many tickets
        UserTable : {
            tickets : r.many.TicketTable({
                from:r.UserTable.id,
                to : r.TicketTable.userId
            })
        },

        // Each ticket belongs to one user and have many issues
        TicketTable : {
            user : r.one.UserTable({
                from : r.TicketTable.userId,
                to : r.UserTable.id
            })
        }
    })
);