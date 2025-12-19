# @repo/db

Shared database package using Drizzle ORM with support for both PostgreSQL and Cloudflare D1.

## Features

- Type-safe database queries with Drizzle ORM
- Dual database support: PostgreSQL (development) and Cloudflare D1 (production)
- Separate schema definitions for PostgreSQL and SQLite/D1
- Type inference for models and inserts
- Migration management with drizzle-kit

## Installation

This package is already included in the monorepo. To use it in your worker:

```json
{
  "dependencies": {
    "@repo/db": "workspace:*"
  }
}
```

## Usage

### Using with Cloudflare D1

```typescript
import { Hono } from "hono";
import { createD1Client, sqlite } from "@repo/db";

interface Env {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

app.get("/users", async (c) => {
  const db = createD1Client(c.env.DB);
  const users = await db.select().from(sqlite.users);
  return c.json(users);
});

app.post("/users", async (c) => {
  const db = createD1Client(c.env.DB);
  const body = await c.req.json<{ email: string; name: string }>();
  const result = await db.insert(sqlite.users).values(body).returning();
  return c.json(result);
});
```

### Using with PostgreSQL

```typescript
import { createPostgresClient, postgres } from "@repo/db";

const db = createPostgresClient(process.env.POSTGRES_URL);
const users = await db.select().from(postgres.users);
```

## Schema Management

Schemas are organized by database type:

- `src/schema/shared.ts` - Common utilities and types
- `src/schema/postgres.ts` - PostgreSQL-specific schemas
- `src/schema/sqlite.ts` - D1/SQLite-specific schemas

### Example Schema

```typescript
// SQLite/D1
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

## Migrations

### Generate Migrations

```bash
# For D1
pnpm db:generate:d1

# For PostgreSQL
pnpm db:generate:postgres
```

### Apply Migrations

```bash
# D1 local
npx wrangler d1 migrations apply YOUR_DB_NAME --local

# D1 production
npx wrangler d1 migrations apply YOUR_DB_NAME

# PostgreSQL
pnpm db:push:postgres
```

## Development Workflow

1. Define your schema in `src/schema/sqlite.ts` or `src/schema/postgres.ts`
2. Generate migrations: `pnpm db:generate:d1`
3. Apply migrations locally: `npx wrangler d1 migrations apply DB_NAME --local`
4. Test your changes
5. Apply to production when ready

## Scripts

- `db:generate:postgres` - Generate PostgreSQL migrations
- `db:generate:d1` - Generate D1 migrations
- `db:push:postgres` - Push schema changes to PostgreSQL
- `db:push:d1` - Push schema changes to D1
- `db:studio:postgres` - Open Drizzle Studio for PostgreSQL
- `db:studio:d1` - Open Drizzle Studio for D1
- `test` - Run tests
- `lint` - Run ESLint
- `typecheck` - Run TypeScript type checking
