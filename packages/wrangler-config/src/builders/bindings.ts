/**
 * Binding builder functions
 */

import type {
  D1Binding,
  KVBinding,
  R2Binding,
  DurableObjectBinding,
  ServiceBinding,
  HyperdriveBinding,
  AIBinding,
  WorkflowsBinding,
} from '../types/bindings.js';

/**
 * Create a D1 database binding
 * 
 * @param binding - Binding name (JavaScript identifier)
 * @param database_name - Human-readable database name
 * @param database_id - Cloudflare database UUID
 * @returns D1Binding object
 * 
 * @example
 * ```ts
 * const db = d1Binding('DB', 'my-database', 'abc-123-def');
 * ```
 */
export function d1Binding(
  binding: string,
  database_name: string,
  database_id: string,
): D1Binding {
  return {
    type: 'd1',
    binding,
    database_name,
    database_id,
  };
}

/**
 * Create a KV namespace binding
 * 
 * @param binding - Binding name (JavaScript identifier)
 * @param id - KV namespace ID
 * @returns KVBinding object
 * 
 * @example
 * ```ts
 * const cache = kvBinding('CACHE', 'kv-namespace-id');
 * ```
 */
export function kvBinding(binding: string, id: string): KVBinding {
  return {
    type: 'kv',
    binding,
    id,
  };
}

/**
 * Create an R2 bucket binding
 * 
 * @param binding - Binding name (JavaScript identifier)
 * @param bucket_name - R2 bucket name
 * @returns R2Binding object
 * 
 * @example
 * ```ts
 * const storage = r2Binding('STORAGE', 'my-bucket');
 * ```
 */
export function r2Binding(binding: string, bucket_name: string): R2Binding {
  return {
    type: 'r2',
    binding,
    bucket_name,
  };
}

/**
 * Create a Durable Object binding
 * 
 * @param binding - Binding name
 * @param class_name - Durable Object class name
 * @param script_name - (Optional) Script containing the DO
 * @returns DurableObjectBinding object
 * 
 * @example
 * ```ts
 * const counter = durableObjectBinding('COUNTER', 'Counter', 'counter-worker');
 * ```
 */
export function durableObjectBinding(
  binding: string,
  class_name: string,
  script_name?: string,
): DurableObjectBinding {
  return {
    type: 'do',
    binding,
    class_name,
    ...(script_name && { script_name }),
  };
}

/**
 * Create a service binding for inter-worker RPC
 * 
 * @param binding - Binding name
 * @param service - Service name to bind to
 * @param environment - (Optional) Service environment
 * @returns ServiceBinding object
 * 
 * @example
 * ```ts
 * const auth = serviceBinding('AUTH', 'auth-service', 'production');
 * ```
 */
export function serviceBinding(
  binding: string,
  service: string,
  environment?: string,
): ServiceBinding {
  return {
    type: 'service',
    binding,
    service,
    ...(environment && { environment }),
  };
}

/**
 * Create a Hyperdrive database connection binding
 * 
 * @param binding - Binding name (JavaScript identifier)
 * @param id - Hyperdrive configuration ID
 * @param localConnectionString - (Optional) Local connection string for development
 * @returns HyperdriveBinding object
 * 
 * @example
 * ```ts
 * const db = hyperdriveBinding('DATABASE', 'hyperdrive-config-id');
 * // With local connection string for development
 * const dbLocal = hyperdriveBinding('DATABASE', 'hyperdrive-config-id', 'postgresql://localhost:5432/mydb');
 * ```
 */
export function hyperdriveBinding(
  binding: string,
  id: string,
  localConnectionString?: string,
): HyperdriveBinding {
  return {
    type: 'hyperdrive',
    binding,
    id,
    ...(localConnectionString && { localConnectionString }),
  };
}

/**
 * Create a Workers AI binding
 * 
 * @param binding - Binding name (JavaScript identifier), defaults to 'AI'
 * @returns AIBinding object
 * 
 * @example
 * ```ts
 * const ai = aiBinding('AI');
 * ```
 */
export function aiBinding(binding: string = 'AI'): AIBinding {
  return {
    type: 'ai',
    binding,
  };
}

/**
 * Create a Workflows binding
 * 
 * @param binding - Binding name (JavaScript identifier)
 * @param class_name - Workflow class name
 * @param script_name - (Optional) Script containing the workflow
 * @returns WorkflowsBinding object
 * 
 * @example
 * ```ts
 * const workflow = workflowsBinding('MY_WORKFLOW', 'MyWorkflow', 'workflow-worker');
 * ```
 */
export function workflowsBinding(
  binding: string,
  class_name: string,
  script_name?: string,
): WorkflowsBinding {
  return {
    type: 'workflows',
    binding,
    class_name,
    ...(script_name && { script_name }),
  };
}
