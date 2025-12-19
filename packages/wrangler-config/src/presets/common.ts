/**
 * Common binding presets
 * 
 * Pre-configured binding patterns for common use cases
 */

import { d1Binding, kvBinding, r2Binding } from '../builders/bindings.js';
import type { D1Binding, KVBinding, R2Binding } from '../types/bindings.js';

/**
 * Common binding presets for frequently used patterns
 */
export const commonBindings = {
  /**
   * Production-ready D1 database binding
   * 
   * @param binding - Binding name
   * @param dbName - Database name
   * @param dbId - Database ID
   * @returns D1Binding
   * 
   * @example
   * ```ts
   * commonBindings.productionD1('DB', 'my-db', 'prod-id')
   * ```
   */
  productionD1(binding: string, dbName: string, dbId: string): D1Binding {
    return d1Binding(binding, dbName, dbId);
  },

  /**
   * Cache KV namespace binding
   * 
   * @param binding - Binding name (default: 'CACHE')
   * @param namespaceId - KV namespace ID
   * @returns KVBinding
   * 
   * @example
   * ```ts
   * commonBindings.cacheKV('CACHE', 'kv-id')
   * ```
   */
  cacheKV(binding: string, namespaceId: string): KVBinding {
    return kvBinding(binding, namespaceId);
  },

  /**
   * Storage R2 bucket binding
   * 
   * @param binding - Binding name (default: 'STORAGE')
   * @param bucketName - R2 bucket name
   * @returns R2Binding
   * 
   * @example
   * ```ts
   * commonBindings.storageBucket('STORAGE', 'my-bucket')
   * ```
   */
  storageBucket(binding: string, bucketName: string): R2Binding {
    return r2Binding(binding, bucketName);
  },

  /**
   * Session storage KV namespace binding
   * 
   * @param namespaceId - KV namespace ID
   * @returns KVBinding
   * 
   * @example
   * ```ts
   * commonBindings.sessionKV('session-kv-id')
   * ```
   */
  sessionKV(namespaceId: string): KVBinding {
    return kvBinding('SESSIONS', namespaceId);
  },
};
