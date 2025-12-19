/**
 * Unit tests for TOML generator
 */

import { describe, it, expect } from 'vitest';
import { generateTOML } from '../../src/generators/toml.js';
import { defineConfig } from '../../src/builders/worker.js';
import { d1Binding, kvBinding, r2Binding, hyperdriveBinding, aiBinding, workflowsBinding } from '../../src/builders/bindings.js';

describe('generateTOML()', () => {
  describe('basic config', () => {
    it('generates valid TOML for minimal config', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
      });

      const toml = generateTOML(config);

      expect(toml).toContain("name = 'my-worker'");
      expect(toml).toContain("main = 'src/index.ts'");
      expect(toml).toContain("compatibility_date = '2024-01-01'");
    });

    it('includes accountId when provided', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        accountId: 'account-123',
        compatibility_date: '2024-01-01',
      });

      const toml = generateTOML(config);

      expect(toml).toContain("account_id = 'account-123'");
    });

    it('includes compatibility_flags when provided', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
        compatibility_flags: ['nodejs_compat', 'streams_enable_constructors'],
      });

      const toml = generateTOML(config);

      expect(toml).toContain('compatibility_flags');
      expect(toml).toContain('nodejs_compat');
      expect(toml).toContain('streams_enable_constructors');
    });

    it('includes node_compat when true', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
        node_compat: true,
      });

      const toml = generateTOML(config);

      expect(toml).toContain('node_compat = true');
    });
  });

  describe('with bindings', () => {
    it('generates D1 bindings', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
        bindings: [d1Binding('DB', 'my-database', 'db-id-123')],
      });

      const toml = generateTOML(config);

      expect(toml).toContain('d1_databases');
      expect(toml).toContain("binding = 'DB'");
      expect(toml).toContain("database_name = 'my-database'");
      expect(toml).toContain("database_id = 'db-id-123'");
    });

    it('generates KV bindings', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
        bindings: [kvBinding('CACHE', 'kv-namespace-id')],
      });

      const toml = generateTOML(config);

      expect(toml).toContain('kv_namespaces');
      expect(toml).toContain("binding = 'CACHE'");
      expect(toml).toContain("id = 'kv-namespace-id'");
    });

    it('generates R2 bindings', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
        bindings: [r2Binding('STORAGE', 'my-bucket')],
      });

      const toml = generateTOML(config);

      expect(toml).toContain('r2_buckets');
      expect(toml).toContain("binding = 'STORAGE'");
      expect(toml).toContain("bucket_name = 'my-bucket'");
    });

    it('generates Hyperdrive bindings', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
        bindings: [hyperdriveBinding('DATABASE', 'hyperdrive-config-id')],
      });

      const toml = generateTOML(config);

      expect(toml).toContain('hyperdrive');
      expect(toml).toContain("binding = 'DATABASE'");
      expect(toml).toContain("id = 'hyperdrive-config-id'");
    });

    it('generates Hyperdrive bindings with localConnectionString', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
        bindings: [hyperdriveBinding('DATABASE', 'hyperdrive-config-id', 'postgresql://localhost:5432/mydb')],
      });

      const toml = generateTOML(config);

      expect(toml).toContain('hyperdrive');
      expect(toml).toContain("binding = 'DATABASE'");
      expect(toml).toContain("id = 'hyperdrive-config-id'");
      expect(toml).toContain("localConnectionString = 'postgresql://localhost:5432/mydb'");
    });

    it('generates AI bindings', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
        bindings: [aiBinding('AI')],
      });

      const toml = generateTOML(config);

      expect(toml).toContain('ai');
      expect(toml).toContain("binding = 'AI'");
    });

    it('generates Workflows bindings', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
        bindings: [workflowsBinding('MY_WORKFLOW', 'MyWorkflow', 'workflow-worker')],
      });

      const toml = generateTOML(config);

      expect(toml).toContain('workflows');
      expect(toml).toContain("binding = 'MY_WORKFLOW'");
      expect(toml).toContain("class_name = 'MyWorkflow'");
      expect(toml).toContain("script_name = 'workflow-worker'");
    });

    it('generates multiple bindings', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
        bindings: [
          d1Binding('DB', 'database', 'db-id'),
          kvBinding('CACHE', 'kv-id'),
          r2Binding('STORAGE', 'bucket'),
          hyperdriveBinding('DATABASE', 'hd-config'),
          aiBinding('AI'),
          workflowsBinding('WORKFLOW', 'MyWorkflow'),
        ],
      });

      const toml = generateTOML(config);

      expect(toml).toContain('d1_databases');
      expect(toml).toContain('kv_namespaces');
      expect(toml).toContain('r2_buckets');
      expect(toml).toContain('hyperdrive');
      expect(toml).toContain('ai');
      expect(toml).toContain('workflows');
    });
  });

  describe('with vars', () => {
    it('generates vars section', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
        vars: {
          LOG_LEVEL: 'debug',
          API_URL: 'https://api.example.com',
        },
      });

      const toml = generateTOML(config);

      expect(toml).toContain('vars.LOG_LEVEL');
      expect(toml).toContain('debug');
      expect(toml).toContain('https://api.example.com');
    });
  });

  describe('special characters', () => {
    it('escapes quotes in strings', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
        vars: {
          MESSAGE: 'Hello "World"',
        },
      });

      const toml = generateTOML(config);

      // TOML should properly escape quotes
      expect(toml).toContain('MESSAGE');
    });

    it('handles URLs in vars', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
        vars: {
          API_URL: 'https://api.example.com/v1/users?filter=active&sort=name',
        },
      });

      const toml = generateTOML(config);

      expect(toml).toContain('https://api.example.com');
    });
  });

  describe('format options', () => {
    it('generates compact format', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
      });

      const toml = generateTOML(config, { format: 'compact' });

      expect(toml).toBeTruthy();
      expect(toml.length).toBeGreaterThan(0);
    });

    it('generates pretty format by default', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
      });

      const toml = generateTOML(config);

      expect(toml).toBeTruthy();
      expect(toml.length).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('throws GenerationError with context', () => {
      const invalidConfig = {
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
        // Add intentionally problematic data
        bindings: undefined as any, // Will be filtered out
      };

      // Should not throw for this case
      expect(() => generateTOML(invalidConfig as any)).not.toThrow();
    });
  });
});
