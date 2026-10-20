In your schema, you need to define relations between three tables:

- `UserTable` → `TicketTable`: One user can create many tickets.
- `TicketTable` → `IssuesTable`: One ticket can be associated with an issue record.
- `UserTable` → `IssuesTable`: If `agents` represents assigned agents, you want to associate issue records with users.

The first two relations are straightforward. The `agents` column needs special attention because it is an array of user IDs, not a standard foreign key to a single user.

## 1. Define the relations

For the `defineRelations` API you're using, the `IssuesTable.ticket` relation should reference `IssuesTable.ticket` and `TicketTable.id`.

```
export const relations = defineRelations(
  { UserTable, TicketTable, IssuesTable },
  (r) => ({
    // A user can create many tickets
    UserTable: {
      tickets: r.many.TicketTable({
        from: r.UserTable.id,
        to: r.TicketTable.userId,
      }),
    },

    // Each ticket belongs to one user and can have many issues
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

    // Each issue belongs to one ticket
    IssuesTable: {
      ticket: r.one.TicketTable({
        from: r.IssuesTable.ticket,
        to: r.TicketTable.id,
      }),
    },
  })
);
```

## 2. What about the `agents` column?

Your current schema has:

```
agents: integer("user_id").array().references(() => UserTable.id),
```

This is problematic because `agents` is an array of integers, whereas `UserTable.id` is a single integer. A normal foreign key cannot enforce that each element in the array references a valid user.

Recommended approach: If an issue can be assigned to multiple agents, create a junction table.

```
export const IssueAgentsTable = pgTable("issue_agents", {
  issueId: integer("issue_id")
    .notNull()
    .references(() => IssuesTable.id, {
      onDelete: "cascade",
    }),

  agentId: integer("agent_id")
    .notNull()
    .references(() => UserTable.id, {
      onDelete: "cascade",
    }),
});
```

Then define the relations for the junction table:

```
export const relations = defineRelations(
  { UserTable, TicketTable, IssuesTable, IssueAgentsTable },
  (r) => ({
    UserTable: {
      tickets: r.many.TicketTable({
        from: r.UserTable.id,
        to: r.TicketTable.userId,
      }),
      assignedIssues: r.many.IssueAgentsTable({
        from: r.UserTable.id,
        to: r.IssueAgentsTable.agentId,
      }),
    },

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
      ticket: r.one.TicketTable({
        from: r.IssuesTable.ticket,
        to: r.TicketTable.id,
      }),
      assignedAgents: r.many.IssueAgentsTable({
        from: r.IssuesTable.id,
        to: r.IssueAgentsTable.issueId,
      }),
    },

    IssueAgentsTable: {
      issue: r.one.IssuesTable({
        from: r.IssueAgentsTable.issueId,
        to: r.IssuesTable.id,
      }),
      agent: r.one.UserTable({
        from: r.IssueAgentsTable.agentId,
        to: r.UserTable.id,
      }),
    },
  })
);
```

Remove the `agents` array from `IssuesTable` if you adopt this approach.

This design gives you proper foreign-key validation and lets you query the agents assigned to each issue through Drizzle's relational query API.