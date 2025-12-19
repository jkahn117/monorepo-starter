# @repo/shared-types

Shared TypeScript types and interfaces for the Cloudflare monorepo template.

## Overview

This package provides a centralized collection of TypeScript types, interfaces, and utility types that can be shared across all applications and packages in the monorepo. This ensures type consistency, reduces duplication, and improves maintainability.

## Installation

This package is already included in the monorepo. To use it in your worker or application:

```json
{
  "dependencies": {
    "@repo/shared-types": "workspace:*"
  }
}
```

## Usage

Import types from the package:

```typescript
import type {
  ApiResponse,
  ErrorResponse,
  HealthCheckResponse,
  DatabaseConfig,
  WorkerEnv,
  BaseEvent,
} from "@repo/shared-types";

// Use in your code
const response: ApiResponse<{ name: string }> = {
  data: { name: "example" },
  message: "Success",
  timestamp: new Date().toISOString(),
};
```

## Exported Types

### API Types (`api.ts`)

Types for HTTP API responses and common API patterns:

- **`ApiResponse<T>`**: Generic API response wrapper
  ```typescript
  interface ApiResponse<T = undefined> {
    data?: T;
    message: string;
    timestamp: string;
  }
  ```

- **`ErrorResponse`**: Standard error response format
  ```typescript
  interface ErrorResponse {
    error: string;
    code: string;
    details?: Record<string, unknown>;
  }
  ```

- **`HealthCheckResponse`**: Health check endpoint response
  ```typescript
  interface HealthCheckResponse {
    status: "ok" | "degraded" | "error";
    version: string;
    uptime: number;
    timestamp: string;
    checks?: Record<string, { status: string; message?: string }>;
  }
  ```

- **`PaginatedResponse<T>`**: Paginated list responses
  ```typescript
  interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }
  ```

### Common Utility Types (`common.ts`)

General-purpose utility types for common patterns:

- **`Nullable<T>`**: Make a type nullable
- **`WithId<T>`**: Add an `id` field to a type
- **`WithTimestamps<T>`**: Add `createdAt` and `updatedAt` fields
- **`DeepPartial<T>`**: Make all nested properties optional
- **`DeepReadonly<T>`**: Make all nested properties readonly
- **`Optional<T, K>`**: Make specific keys optional
- **`RequireAtLeastOne<T, Keys>`**: Require at least one of specified keys
- **`RequireOnlyOne<T, Keys>`**: Require exactly one of specified keys
- **`Prettify<T>`**: Flatten intersections for better IDE hints

### Database Types (`database.ts`)

Types for database operations using Drizzle ORM:

- **`DatabaseConfig`**: Database connection configuration
- **`DatabaseStatus`**: Connection status information
- **`QueryMetadata`**: Query execution metadata
- **`TransactionOptions`**: Transaction configuration
- **`MigrationInfo`**: Migration tracking information
- **`DatabaseClient`**: Generic database client interface
- **`DatabaseError`**: Database error types
- **`QueryBuilderResult<T>`**: Query result wrapper

### Worker Types (`worker.ts`)

Cloudflare Workers-specific types and bindings:

- **`WorkerEnv`**: Base worker environment interface
- **`WorkerContext`**: Execution context
- **`WorkerRequestContext<Env>`**: Combined request context
- **`ScheduledEvent`**: Cron trigger event
- **`QueueMessageBatch<Body>`**: Queue message batch
- **`FetchHandler<Env>`**: HTTP request handler type
- **`ScheduledHandler<Env>`**: Scheduled event handler type
- **`QueueHandler<Env, Body>`**: Queue message handler type
- **`WorkerConfig`**: Worker configuration
- **`WorkerDeployment`**: Deployment information
- **`WorkerMetrics`**: Worker performance metrics
- **`KVNamespace`**: KV storage binding
- **`R2Bucket`**: R2 object storage binding

### Event Types (`events.ts`)

Types for event-driven architectures and event sourcing:

- **`BaseEvent`**: Base event interface
- **`DomainEvent<T>`**: Business logic events
- **`IntegrationEvent<T>`**: Cross-service events
- **`SystemEvent<T>`**: Infrastructure events
- **`EventEnvelope<T>`**: Event wrapper with routing
- **`EventHandler<T>`**: Event handler function type
- **`EventBus`**: Event bus interface
- **`EventStore`**: Event store interface for event sourcing
- **Common event types**: `UserCreatedEvent`, `UserUpdatedEvent`, etc.
- **Event factories**: `createBaseEvent`, `createDomainEvent`

## Examples

### API Response

```typescript
import type { ApiResponse, PaginatedResponse } from "@repo/shared-types";

// Simple response
export function getUser(id: string): ApiResponse<User> {
  return {
    data: { id, name: "John Doe", email: "john@example.com" },
    message: "User retrieved successfully",
    timestamp: new Date().toISOString(),
  };
}

// Paginated response
export function getUsers(page: number): PaginatedResponse<User> {
  return {
    data: [/* users */],
    pagination: {
      page: 1,
      pageSize: 10,
      total: 100,
      totalPages: 10,
    },
    message: "Users retrieved successfully",
    timestamp: new Date().toISOString(),
  };
}
```

### Worker Environment

```typescript
import type { WorkerEnv, KVNamespace, R2Bucket } from "@repo/shared-types";

interface Env extends WorkerEnv {
  DB: D1Database;
  CACHE: KVNamespace;
  STORAGE: R2Bucket;
  API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Access typed bindings
    const cached = await env.CACHE.get("key");
    const file = await env.STORAGE.get("file.txt");
    
    return new Response("OK");
  },
};
```

### Domain Events

```typescript
import { createDomainEvent, type DomainEvent } from "@repo/shared-types";

const event = createDomainEvent(
  "UserCreated",
  user.id,
  "User",
  { email: user.email, name: user.name },
  "auth-service",
);

// Complete event with ID and timestamp
const completeEvent: DomainEvent = {
  ...event,
  id: crypto.randomUUID(),
  timestamp: new Date(),
};
```

## Type Safety Benefits

- **Consistency**: Same types across all packages ensure API contracts
- **Autocomplete**: Full IDE support with type hints
- **Refactoring**: Change types in one place, TypeScript finds all usages
- **Documentation**: Types serve as inline documentation
- **Error Prevention**: Catch type errors at compile time

## Development

### Adding New Types

1. Create or edit a type module in `src/` (e.g., `src/payment.ts`)
2. Export your types from the module
3. Add the module export to `src/index.ts`
4. Add tests in `test/`
5. Update this README with documentation

### Running Tests

```bash
# From the monorepo root
pnpm --filter @repo/shared-types test

# Or from this package
cd packages/shared-types
pnpm test
```

## Best Practices

1. **Keep types generic**: Don't include implementation details
2. **Use descriptive names**: `UserCreatedEvent` not `Event1`
3. **Document complex types**: Add JSDoc comments for non-obvious types
4. **Version carefully**: Breaking type changes affect all consumers
5. **Use utility types**: Leverage TypeScript's built-in and custom utilities
6. **Test your types**: Write tests to validate type inference and imports

## License

MIT
