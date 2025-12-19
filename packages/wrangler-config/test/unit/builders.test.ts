/**
 * Unit tests for binding builder functions
 */

import { describe, it, expect } from 'vitest';
import {
  d1Binding,
  kvBinding,
  r2Binding,
  durableObjectBinding,
  serviceBinding,
} from '../../src/builders/bindings.js';

describe('d1Binding()', () => {
  it('creates a valid D1 binding', () => {
    const binding = d1Binding('DB', 'my-database', 'abc-123-def');

    expect(binding).toEqual({
      type: 'd1',
      binding: 'DB',
      database_name: 'my-database',
      database_id: 'abc-123-def',
    });
  });

  it('accepts binding names with underscores', () => {
    const binding = d1Binding('MY_DB', 'database', 'id');

    expect(binding.binding).toBe('MY_DB');
  });

  it('accepts database IDs in any format', () => {
    const binding = d1Binding('DB', 'db', 'uuid-123-456');

    expect(binding.database_id).toBe('uuid-123-456');
  });
});

describe('kvBinding()', () => {
  it('creates a valid KV binding', () => {
    const binding = kvBinding('CACHE', 'kv-namespace-id');

    expect(binding).toEqual({
      type: 'kv',
      binding: 'CACHE',
      id: 'kv-namespace-id',
    });
  });

  it('accepts any namespace ID format', () => {
    const binding = kvBinding('KV', 'ns-123');

    expect(binding.id).toBe('ns-123');
  });
});

describe('r2Binding()', () => {
  it('creates a valid R2 binding', () => {
    const binding = r2Binding('STORAGE', 'my-bucket');

    expect(binding).toEqual({
      type: 'r2',
      binding: 'STORAGE',
      bucket_name: 'my-bucket',
    });
  });

  it('accepts bucket names with hyphens', () => {
    const binding = r2Binding('BUCKET', 'my-storage-bucket');

    expect(binding.bucket_name).toBe('my-storage-bucket');
  });
});

describe('durableObjectBinding()', () => {
  it('creates a valid DO binding without script_name', () => {
    const binding = durableObjectBinding('COUNTER', 'Counter');

    expect(binding).toEqual({
      type: 'do',
      binding: 'COUNTER',
      class_name: 'Counter',
    });
  });

  it('creates a valid DO binding with script_name', () => {
    const binding = durableObjectBinding('COUNTER', 'Counter', 'counter-worker');

    expect(binding).toEqual({
      type: 'do',
      binding: 'COUNTER',
      class_name: 'Counter',
      script_name: 'counter-worker',
    });
  });

  it('omits script_name when undefined', () => {
    const binding = durableObjectBinding('DO', 'MyDO', undefined);

    expect(binding).not.toHaveProperty('script_name');
  });
});

describe('serviceBinding()', () => {
  it('creates a valid service binding without environment', () => {
    const binding = serviceBinding('AUTH', 'auth-service');

    expect(binding).toEqual({
      type: 'service',
      binding: 'AUTH',
      service: 'auth-service',
    });
  });

  it('creates a valid service binding with environment', () => {
    const binding = serviceBinding('AUTH', 'auth-service', 'production');

    expect(binding).toEqual({
      type: 'service',
      binding: 'AUTH',
      service: 'auth-service',
      environment: 'production',
    });
  });

  it('omits environment when undefined', () => {
    const binding = serviceBinding('SVC', 'my-service', undefined);

    expect(binding).not.toHaveProperty('environment');
  });
});
