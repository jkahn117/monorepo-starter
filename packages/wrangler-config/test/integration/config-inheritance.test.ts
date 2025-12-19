/**
 * Integration test: Centralized configuration
 * 
 * User Story 1 Acceptance Test:
 * Create a shared configuration package, reference it from two different workers,
 * verify both workers have identical Cloudflare binding configurations without duplication.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defineConfig, d1Binding, kvBinding, generateTOML, writeConfigFile } from '../../src/index.js';

describe('US1: Centralized Configuration Source', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = await mkdtemp(join(tmpdir(), 'wrangler-config-test-'));
  });

  afterEach(async () => {
    // Clean up test directory
    await rm(testDir, { recursive: true, force: true });
  });

  it('allows two workers to share identical configuration without duplication', async () => {
    // Define shared base configuration
    const sharedConfig = {
      accountId: 'shared-account-123',
      compatibility_date: '2024-01-01',
      compatibility_flags: ['nodejs_compat'],
      bindings: [
        d1Binding('DB', 'shared-database', 'shared-db-id'),
        kvBinding('CACHE', 'shared-kv-id'),
      ],
    };

    // Worker A uses shared configuration
    const workerA = defineConfig({
      name: 'worker-a',
      main: 'src/index.ts',
      ...sharedConfig,
    });

    // Worker B uses shared configuration
    const workerB = defineConfig({
      name: 'worker-b',
      main: 'src/index.ts',
      ...sharedConfig,
    });

    // Verify both workers have identical bindings
    expect(workerA.bindings).toEqual(workerB.bindings);
    expect(workerA.accountId).toBe(workerB.accountId);
    expect(workerA.compatibility_date).toBe(workerB.compatibility_date);
    expect(workerA.compatibility_flags).toEqual(workerB.compatibility_flags);

    // Generate TOML for both workers
    const tomlA = generateTOML(workerA);
    const tomlB = generateTOML(workerB);

    // Both should have the same bindings
    expect(tomlA).toContain("binding = 'DB'");
    expect(tomlB).toContain("binding = 'DB'");
    expect(tomlA).toContain("binding = 'CACHE'");
    expect(tomlB).toContain("binding = 'CACHE'");
  });

  it('inherits shared settings automatically', async () => {
    // Shared configuration
    const baseConfig = {
      accountId: 'test-account',
      compatibility_date: '2024-01-01',
      compatibility_flags: ['nodejs_compat'],
    };

    // New worker references shared config
    const worker = defineConfig({
      name: 'my-worker',
      main: 'src/index.ts',
      ...baseConfig,
    });

    // Worker inherits all shared settings
    expect(worker.accountId).toBe('test-account');
    expect(worker.compatibility_date).toBe('2024-01-01');
    expect(worker.compatibility_flags).toContain('nodejs_compat');
  });

  it('updates configuration across all workers when shared config changes', async () => {
    // Initial shared configuration
    let sharedConfig = {
      accountId: 'account-v1',
      compatibility_date: '2024-01-01',
      bindings: [d1Binding('DB', 'db-v1', 'id-v1')],
    };

    // Create worker with initial config
    const worker1 = defineConfig({
      name: 'worker-1',
      main: 'src/index.ts',
      ...sharedConfig,
    });

    expect(worker1.accountId).toBe('account-v1');
    expect(worker1.bindings![0]).toMatchObject({
      binding: 'DB',
      database_name: 'db-v1',
    });

    // Update shared configuration (simulating a change)
    sharedConfig = {
      accountId: 'account-v2',
      compatibility_date: '2024-01-01',
      bindings: [d1Binding('DB', 'db-v2', 'id-v2')],
    };

    // Rebuild worker with updated config
    const worker2 = defineConfig({
      name: 'worker-1',
      main: 'src/index.ts',
      ...sharedConfig,
    });

    // Worker reflects the updated configuration
    expect(worker2.accountId).toBe('account-v2');
    expect(worker2.bindings![0]).toMatchObject({
      binding: 'DB',
      database_name: 'db-v2',
    });
  });

  it('writes configuration files for multiple workers', async () => {
    const sharedBindings = [
      d1Binding('DB', 'shared-db', 'db-id'),
      kvBinding('CACHE', 'kv-id'),
    ];

    // Worker A
    const workerA = defineConfig({
      name: 'worker-a',
      main: 'src/index.ts',
      compatibility_date: '2024-01-01',
      bindings: sharedBindings,
    });

    // Worker B
    const workerB = defineConfig({
      name: 'worker-b',
      main: 'src/index.ts',
      compatibility_date: '2024-01-01',
      bindings: sharedBindings,
    });

    // Write configuration files
    const workerADir = join(testDir, 'worker-a');
    const workerBDir = join(testDir, 'worker-b');
    
    await mkdir(workerADir, { recursive: true });
    await mkdir(workerBDir, { recursive: true });

    await writeConfigFile(workerA, join(workerADir, 'wrangler.toml'), 'toml');
    await writeConfigFile(workerB, join(workerBDir, 'wrangler.toml'), 'toml');

    // Both files should exist and contain shared bindings
    const { readFile } = await import('node:fs/promises');
    const contentA = await readFile(join(workerADir, 'wrangler.toml'), 'utf-8');
    const contentB = await readFile(join(workerBDir, 'wrangler.toml'), 'utf-8');

    expect(contentA).toContain("binding = 'DB'");
    expect(contentB).toContain("binding = 'DB'");
    expect(contentA).toContain("binding = 'CACHE'");
    expect(contentB).toContain("binding = 'CACHE'");
  });
});
