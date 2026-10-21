# Drizzle ORM: Understanding Push vs Generate + Migrate

Since you're coming from MongoDB and learning SQL for the first time, let's build this up from the basics. Once you understand what the database is doing, `push`, `generate`, and `migrate` will make a lot more sense.

The most important idea is this:

**Your Drizzle schema describes what your database should look like. Your PostgreSQL database is where the actual tables and data live.** Drizzle Kit helps keep those two in sync.

## 1. First, understand the MongoDB vs SQL difference

In MongoDB, you might have a collection of issues that looks like this:

```javascript
// MongoDB document
{
  _id: ObjectId("..."),
  title: "Fix login bug",
  assignedAgents: [
    ObjectId("...")
  ]
}
```

MongoDB stores documents in collections. You can often add new fields to a document without changing a formal schema first.

In PostgreSQL, the same application might use separate tables:

### Issues table

| id | title |
|---|---|
| 1 | Fix login bug |
| 2 | Fix navbar |

### Users table

| id | name |
|---|---|
| 10 | Alice |
| 11 | Bob |

### IssueAgents table

| issue | agent |
|---|---|
| 1 | 10 |
| 1 | 11 |

Issue 1 is assigned to both Alice and Bob. The IDs connect records across tables.

That last table is an example of a **join table**. Instead of storing an array of agents inside an issue, it stores one row for each issue-agent assignment.

SQL databases define their structure using tables, columns, data types, constraints, and relationships. Your Drizzle schema is TypeScript code that describes much of this structure.

---

## 2. What does `push` actually do?

Imagine you create this Drizzle schema:

```typescript
import * as p from "drizzle-orm/pg-core";

export const users = p.pgTable("users", {
  id: p.integer().primaryKey(),
  name: p.text().notNull(),
});
```

You've described a table in TypeScript, but **writing this code does not create the table in PostgreSQL**.

Your database might still be completely empty.

When you run:

```bash
npx drizzle-kit push
```

Drizzle Kit compares your TypeScript schema with the actual database structure and applies the necessary changes.

For example, it may execute SQL equivalent to:

```sql
CREATE TABLE "users" (
  "id" integer PRIMARY KEY,
  "name" text NOT NULL
);
```

Now the table exists in PostgreSQL.

Think of `push` as telling Drizzle:

> "Look at my current schema and make my database match it."

### What if you change the schema?

Suppose you add an email column:

```typescript
export const users = p.pgTable("users", {
  id: p.integer().primaryKey(),
  name: p.text().notNull(),
  email: p.text(),
});
```

Run `npx drizzle-kit push` again. Drizzle detects that the database is missing the `email` column and applies an appropriate change, such as:

```sql
ALTER TABLE "users"
ADD COLUMN "email" text;
```

You don't need to write that SQL yourself.

One thing to remember: if a schema change could destroy existing data, review Drizzle's proposed changes carefully before accepting them.

---

## 3. What do `generate` and `migrate` do differently?

This approach splits the work into two separate steps.

### Step A: `generate` — prepare the SQL changes

```bash
npx drizzle-kit generate
```

Drizzle looks at your current TypeScript schema and compares it with the most recent generated migration snapshot. It then creates migration files containing SQL statements. **It doesn't apply those migrations to your database.**

For example, you might get this project structure:

```text
my-project/
├── src/
│   └── schema.ts
└── drizzle/
    └── 0000_initial/
        ├── migration.sql
        └── snapshot.json
```

The exact migration folder name will vary.

Inside `migration.sql`, you might see:

```sql
CREATE TABLE "users" (
  "id" integer PRIMARY KEY,
  "name" text NOT NULL
);
```

This is ordinary SQL! You can open the file and learn how your TypeScript definitions translate into SQL commands.

The migration file is also something you can save in Git, share with teammates, and deploy along with your application.

### Step B: `migrate` — apply the SQL changes

```bash
npx drizzle-kit migrate
```

Drizzle reads your generated migration files and applies any migrations that haven't been applied yet. It also records successful migrations in a database migration log.

In simple terms:

- `generate` creates the instructions.
- `migrate` executes the instructions.

---

## 4. Compare the two workflows

### Workflow A: Push

**TypeScript schema**

↓

**`drizzle-kit push`**

Compares schema and database, then applies changes.

↓

**Database updated**

### Workflow B: Generate + migrate

**TypeScript schema**

↓

**`drizzle-kit generate`**

Creates migration SQL files.

↓

**`drizzle-kit migrate`**

Executes unapplied migration files.

↓

**Database updated**

Both can create the same table. The main difference is whether you create and keep migration files as part of the process.

---

## 5. Why are migration files useful in real projects?

Imagine you're building your issue-tracking application.

On Monday, your `issues` table has a title:

```typescript
title: p.text().notNull(),
```

You generate and apply your initial migration.

On Tuesday, you decide every issue needs a status:

```typescript
title: p.text().notNull(),
status: p.text().notNull().default("open"),
```

You generate another migration and apply it.

Now your project has a record of both changes:

- Migration 1: Create the issues table.
- Migration 2: Add the status column.

That history is valuable because your database will change as your application grows.

Suppose you deploy your app to a server, and a teammate deploys the same code elsewhere. Both environments can apply the same migration files, helping their database structures stay consistent.

Without migration files, you may know what your current schema looks like, but you don't necessarily have a saved history of how to get another database to that state.

One subtle point: migrations are not automatically a rollback system. If you need to undo a change, you may need to write a new migration or restore data from a backup.

---

## 6. What I recommend while you're learning

Since you're learning both SQL and Drizzle, start with `push` to understand how schema changes affect the database. Then practice migrations so you learn how real projects manage database changes.

### Practice exercise

#### Step 1: Create your first table

Schema:

```typescript
export const users = p.pgTable("users", {
  id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
  name: p.text().notNull(),
});
```

Command:

```bash
npx drizzle-kit push
```

This creates the users table directly in PostgreSQL.

#### Step 2: Add an email column

Schema:

```typescript
export const users = p.pgTable("users", {
  id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
  name: p.text().notNull(),
  email: p.text(),
});
```

Command:

```bash
npx drizzle-kit push
```

This updates the existing table by adding the email column.

#### Step 3: Try the migration workflow

Your schema stays as it is.

Command:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

In a separate practice database, make a new schema change, generate a migration, inspect its SQL, and apply it.

Make sure you configure `drizzle.config.ts` correctly and use a development database for these exercises.

---

## Key takeaway

`push` is convenient for quickly synchronizing your schema and database. `generate` + `migrate` teaches you how database changes are recorded and applied in a controlled, repeatable way.

Both are legitimate workflows; you don't need to use both for every schema change.
