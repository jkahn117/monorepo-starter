/**
 * Unit tests for RPC type generation
 */

import { describe, it, expect } from 'vitest';
import { discoverRPCWorkers, generateRPCTypes } from '../../src/generators/typegen.js';
import { defineConfig, d1Binding } from '../../src/index.js';

describe('discoverRPCWorkers()', () => {
  it('finds workers with exposeRPC: true', () => {
    const workerA = defineConfig({
      name: 'worker-a',
      main: 'src/index.ts',
      compatibility_date: '2024-01-01',
      exposeRPC: true,
    });

    const workerB = defineConfig({
      name: 'worker-b',
      main: 'src/index.ts',
      compatibility_date: '2024-01-01',
      exposeRPC: false,
    });

    const workerC = defineConfig({
      name: 'worker-c',
      main: 'src/index.ts',
      compatibility_date: '2024-01-01',
      // No exposeRPC field
    });

    const rpcWorkers = discoverRPCWorkers([workerA, workerB, workerC]);

    expect(rpcWorkers).toHaveLength(1);
    expect(rpcWorkers[0].workerName).toBe('worker-a');
    expect(rpcWorkers[0].exposeRPC).toBe(true);
  });

  it('returns empty array when no workers expose RPC', () => {
    const worker = defineConfig({
      name: 'worker',
      main: 'src/index.ts',
      compatibility_date: '2024-01-01',
    });

    const rpcWorkers = discoverRPCWorkers([worker]);

    expect(rpcWorkers).toHaveLength(0);
  });

  it('includes source path in declaration', () => {
    const worker = defineConfig({
      name: 'auth-worker',
      main: 'src/auth.ts',
      compatibility_date: '2024-01-01',
      exposeRPC: true,
    });

    const rpcWorkers = discoverRPCWorkers([worker]);

    expect(rpcWorkers[0].sourcePath).toBe('src/auth.ts');
  });
});

describe('generateRPCTypes()', () => {
  it('returns type definition metadata', async () => {
    const result = await generateRPCTypes('auth-worker', 'src/index.ts', 'generated-types');

    expect(result.workerName).toBe('auth-worker');
    expect(result.typesPath).toContain('auth-worker');
    expect(result.typesPath).toContain('index.d.ts');
    expect(result.generatedAt).toBeInstanceOf(Date);
  });

  it('constructs correct types path', async () => {
    const result = await generateRPCTypes('my-worker', 'src/index.ts', 'types');

    expect(result.typesPath).toBe('types/my-worker/index.d.ts');
  });
});

describe('RPC Configuration', () => {
  it('allows exposeRPC field in config', () => {
    const config = defineConfig({
      name: 'rpc-worker',
      main: 'src/index.ts',
      compatibility_date: '2024-01-01',
      exposeRPC: true,
      bindings: [d1Binding('DB', 'db', 'id')],
    });

    expect(config.exposeRPC).toBe(true);
  });

  it('defaults exposeRPC to undefined when not specified', () => {
    const config = defineConfig({
      name: 'worker',
      main: 'src/index.ts',
      compatibility_date: '2024-01-01',
    });

    expect(config.exposeRPC).toBeUndefined();
  });
});
