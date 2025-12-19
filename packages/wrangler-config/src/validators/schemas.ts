/**
 * Zod validation schemas for Wrangler configuration
 */

import { z } from 'zod';

/**
 * Valid JavaScript identifier pattern
 */
const identifierRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

/**
 * Date format YYYY-MM-DD
 */
const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

/**
 * D1 Binding schema
 */
export const D1BindingSchema = z.object({
  type: z.literal('d1'),
  binding: z.string().min(1).regex(identifierRegex, 'Binding must be a valid JavaScript identifier'),
  database_name: z.string().min(1),
  database_id: z.string().min(1),
});

/**
 * KV Binding schema
 */
export const KVBindingSchema = z.object({
  type: z.literal('kv'),
  binding: z.string().min(1).regex(identifierRegex, 'Binding must be a valid JavaScript identifier'),
  id: z.string().min(1),
});

/**
 * R2 Binding schema
 */
export const R2BindingSchema = z.object({
  type: z.literal('r2'),
  binding: z.string().min(1).regex(identifierRegex, 'Binding must be a valid JavaScript identifier'),
  bucket_name: z.string().min(1),
});

/**
 * Durable Object Binding schema
 */
export const DurableObjectBindingSchema = z.object({
  type: z.literal('do'),
  binding: z.string().min(1).regex(identifierRegex, 'Binding must be a valid JavaScript identifier'),
  class_name: z.string().min(1),
  script_name: z.string().optional(),
});

/**
 * Service Binding schema
 */
export const ServiceBindingSchema = z.object({
  type: z.literal('service'),
  binding: z.string().min(1).regex(identifierRegex, 'Binding must be a valid JavaScript identifier'),
  service: z.string().min(1),
  environment: z.string().optional(),
});

/**
 * Analytics Engine Binding schema
 */
export const AnalyticsEngineBindingSchema = z.object({
  type: z.literal('analytics_engine'),
  binding: z.string().min(1).regex(identifierRegex, 'Binding must be a valid JavaScript identifier'),
  dataset: z.string().min(1),
});

/**
 * Queue Binding schema
 */
export const QueueBindingSchema = z.object({
  type: z.literal('queue'),
  binding: z.string().min(1).regex(identifierRegex, 'Binding must be a valid JavaScript identifier'),
  queue_name: z.string().min(1),
});

/**
 * Hyperdrive Binding schema
 */
export const HyperdriveBindingSchema = z.object({
  type: z.literal('hyperdrive'),
  binding: z.string().min(1).regex(identifierRegex, 'Binding must be a valid JavaScript identifier'),
  id: z.string().min(1),
  localConnectionString: z.string().optional(),
});

/**
 * AI Binding schema
 */
export const AIBindingSchema = z.object({
  type: z.literal('ai'),
  binding: z.string().min(1).regex(identifierRegex, 'Binding must be a valid JavaScript identifier'),
});

/**
 * Workflows Binding schema
 */
export const WorkflowsBindingSchema = z.object({
  type: z.literal('workflows'),
  binding: z.string().min(1).regex(identifierRegex, 'Binding must be a valid JavaScript identifier'),
  class_name: z.string().min(1),
  script_name: z.string().optional(),
});

/**
 * Discriminated union of all binding types
 */
export const BindingSchema = z.discriminatedUnion('type', [
  D1BindingSchema,
  KVBindingSchema,
  R2BindingSchema,
  DurableObjectBindingSchema,
  ServiceBindingSchema,
  AnalyticsEngineBindingSchema,
  QueueBindingSchema,
  HyperdriveBindingSchema,
  AIBindingSchema,
  WorkflowsBindingSchema,
]);

/**
 * Route schema
 */
export const RouteSchema = z.object({
  pattern: z.string().min(1),
  zone_id: z.string().optional(),
  zone_name: z.string().optional(),
  custom_domain: z.boolean().optional(),
});

/**
 * Trigger configuration schema
 */
export const TriggerConfigSchema = z.object({
  crons: z.array(z.string()).optional(),
  queues: z
    .array(
      z.object({
        queue: z.string(),
        max_batch_size: z.number().optional(),
        max_batch_timeout: z.number().optional(),
        max_retries: z.number().optional(),
        dead_letter_queue: z.string().optional(),
      }),
    )
    .optional(),
});

/**
 * Environment configuration schema
 */
export const EnvironmentConfigSchema = z.object({
  name: z.string().min(1).max(64).optional(),
  accountId: z.string().optional(),
  routes: z.array(RouteSchema).optional(),
  bindings: z.array(BindingSchema).optional(),
  vars: z.record(z.string()).optional(),
});

/**
 * Main Wrangler configuration schema
 */
export const WranglerConfigSchema = z.object({
  name: z.string().min(1).max(64),
  main: z
    .string()
    .min(1)
    .refine((val) => val.endsWith('.ts') || val.endsWith('.js'), {
      message: 'main must end with .ts or .js',
    }),
  accountId: z.string().optional(),
  compatibility_date: z.string().regex(dateFormatRegex, 'compatibility_date must be in YYYY-MM-DD format'),
  compatibility_flags: z.array(z.string()).optional(),
  node_compat: z.boolean().optional(),
  bindings: z.array(BindingSchema).optional(),
  vars: z.record(z.string()).optional(),
  secrets: z.array(z.string()).optional(),
  routes: z.array(RouteSchema).optional(),
  triggers: TriggerConfigSchema.optional(),
  env: z.record(EnvironmentConfigSchema).optional(),
  exposeRPC: z.boolean().optional(),
});
