import {integer, text, boolean, pgTable, varchar, pgEnum} from "drizzle-orm/pg-core";

export const userRoles = pgEnum("user_role", ["admin", "customer"])

export const UserTable = pgTable("users", {
    id : integer().primaryKey().generatedAlwaysAsIdentity(),
    name : varchar().notNull(),
    email: varchar().notNull().unique(),
    password : varchar().notNull(),
    googleId : varchar().unique(),

    role : userRoles().notNull().default("customer")
})