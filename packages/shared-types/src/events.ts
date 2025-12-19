/**
 * Event types for event-driven architectures
 */

/**
 * Base event interface that all events should extend
 */
export interface BaseEvent {
  /**
   * Unique event identifier
   */
  id: string;

  /**
   * Event type/name
   */
  type: string;

  /**
   * Timestamp when event was created
   */
  timestamp: Date;

  /**
   * Event source/origin
   */
  source: string;

  /**
   * Event version for schema evolution
   */
  version: string;

  /**
   * Optional correlation ID for tracking related events
   */
  correlationId?: string;

  /**
   * Optional causation ID (ID of the event that caused this event)
   */
  causationId?: string;

  /**
   * Event metadata
   */
  metadata?: EventMetadata;
}

/**
 * Event metadata
 */
export interface EventMetadata {
  /**
   * User or system that triggered the event
   */
  userId?: string;

  /**
   * IP address of the request
   */
  ipAddress?: string;

  /**
   * User agent string
   */
  userAgent?: string;

  /**
   * Additional custom metadata
   */
  [key: string]: unknown;
}

/**
 * Domain event for business logic events
 */
export interface DomainEvent<T = unknown> extends BaseEvent {
  /**
   * Event payload/data
   */
  data: T;

  /**
   * Aggregate ID this event belongs to
   */
  aggregateId: string;

  /**
   * Aggregate type
   */
  aggregateType: string;
}

/**
 * Integration event for cross-service communication
 */
export interface IntegrationEvent<T = unknown> extends BaseEvent {
  /**
   * Event payload/data
   */
  data: T;

  /**
   * Target service(s)
   */
  targets?: string[];
}

/**
 * System event for infrastructure/system-level events
 */
export interface SystemEvent<T = unknown> extends BaseEvent {
  /**
   * Event payload/data
   */
  data: T;

  /**
   * Severity level
   */
  severity: "info" | "warning" | "error" | "critical";

  /**
   * Component that emitted the event
   */
  component: string;
}

/**
 * Event envelope for wrapping events with additional context
 */
export interface EventEnvelope<T extends BaseEvent = BaseEvent> {
  /**
   * The actual event
   */
  event: T;

  /**
   * Routing information
   */
  routing?: {
    exchange?: string;
    routingKey?: string;
    queue?: string;
  };

  /**
   * Delivery information
   */
  delivery?: {
    attempt: number;
    maxAttempts: number;
    nextRetryAt?: Date;
  };
}

/**
 * Event handler function type
 */
export type EventHandler<T extends BaseEvent = BaseEvent> = (
  event: T,
) => Promise<void> | void;

/**
 * Event bus interface
 */
export interface EventBus {
  /**
   * Publish an event
   */
  publish<T extends BaseEvent>(event: T): Promise<void>;

  /**
   * Subscribe to events
   */
  subscribe<T extends BaseEvent>(
    eventType: string,
    handler: EventHandler<T>,
  ): () => void;

  /**
   * Unsubscribe from events
   */
  unsubscribe(eventType: string, handler: EventHandler): void;
}

/**
 * Event store interface for event sourcing
 */
export interface EventStore {
  /**
   * Append event to stream
   */
  append(streamId: string, event: DomainEvent): Promise<void>;

  /**
   * Read events from stream
   */
  read(streamId: string, fromVersion?: number): Promise<DomainEvent[]>;

  /**
   * Get stream version
   */
  getStreamVersion(streamId: string): Promise<number>;
}

/**
 * Common event types
 */
export type UserCreatedEvent = DomainEvent<{
  userId: string;
  email: string;
  name: string;
}>;

export type UserUpdatedEvent = DomainEvent<{
  userId: string;
  changes: Record<string, unknown>;
}>;

export type UserDeletedEvent = DomainEvent<{
  userId: string;
}>;

export type ErrorOccurredEvent = SystemEvent<{
  error: string;
  stack?: string;
  context?: Record<string, unknown>;
}>;

/**
 * Event factory helpers
 */
export function createBaseEvent(
  type: string,
  source: string,
  version: string = "1.0.0",
): Omit<BaseEvent, "id" | "timestamp"> {
  return {
    type,
    source,
    version,
  };
}

export function createDomainEvent<T>(
  type: string,
  aggregateId: string,
  aggregateType: string,
  data: T,
  source: string,
): Omit<DomainEvent<T>, "id" | "timestamp"> {
  return {
    ...createBaseEvent(type, source),
    data,
    aggregateId,
    aggregateType,
  };
}
