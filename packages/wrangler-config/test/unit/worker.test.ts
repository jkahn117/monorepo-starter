/**
 * Unit tests for worker configuration builder
 */

import { describe, it, expect } from 'vitest';
import { defineConfig, ConfigValidationError } from '../../src/builders/worker.js';
import { d1Binding, kvBinding } from '../../src/builders/bindings.js';

describe('defineConfig()', () => {
  describe('happy path', () => {
    it('creates a valid configuration with required fields only', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
      });

      expect(config.name).toBe('my-worker');
      expect(config.main).toBe('src/index.ts');
      expect(config.compatibility_date).toBe('2024-01-01');
    });

    it('creates a valid configuration with all fields', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        accountId: 'account-123',
        compatibility_date: '2024-01-01',
        compatibility_flags: ['nodejs_compat'],
        node_compat: true,
        bindings: [d1Binding('DB', 'my-db', 'db-id')],
        vars: { LOG_LEVEL: 'debug' },
        secrets: ['API_KEY'],
      });

      expect(config).toMatchObject({
        name: 'my-worker',
        main: 'src/index.ts',
        accountId: 'account-123',
        compatibility_date: '2024-01-01',
        compatibility_flags: ['nodejs_compat'],
        node_compat: true,
        vars: { LOG_LEVEL: 'debug' },
        secrets: ['API_KEY'],
      });
      expect(config.bindings).toHaveLength(1);
    });

    it('accepts .js main file', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'dist/index.js',
        compatibility_date: '2024-01-01',
      });

      expect(config.main).toBe('dist/index.js');
    });
  });

  describe('default values', () => {
    it('applies empty array for compatibility_flags', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
      });

      expect(config.compatibility_flags).toEqual([]);
    });

    it('applies false for node_compat', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
      });

      expect(config.node_compat).toBe(false);
    });

    it('applies empty array for bindings', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
      });

      expect(config.bindings).toEqual([]);
    });

    it('applies empty object for vars', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
      });

      expect(config.vars).toEqual({});
    });

    it('applies empty array for secrets', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
      });

      expect(config.secrets).toEqual([]);
    });
  });

  describe('missing required fields', () => {
    it('throws when name is missing', () => {
      expect(() =>
        defineConfig({
          // @ts-expect-error - Testing missing required field
          main: 'src/index.ts',
          compatibility_date: '2024-01-01',
        }),
      ).toThrow(ConfigValidationError);
    });

    it('throws when main is missing', () => {
      expect(() =>
        defineConfig({
          name: 'my-worker',
          // @ts-expect-error - Testing missing required field
          compatibility_date: '2024-01-01',
        }),
      ).toThrow(ConfigValidationError);
    });

    it('throws when compatibility_date is missing', () => {
      expect(() =>
        defineConfig({
          name: 'my-worker',
          main: 'src/index.ts',
          // @ts-expect-error - Testing missing required field
        }),
      ).toThrow(ConfigValidationError);
    });

    it('provides helpful error message for missing name', () => {
      try {
        defineConfig({
          // @ts-expect-error - Testing missing required field
          main: 'src/index.ts',
          compatibility_date: '2024-01-01',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ConfigValidationError);
        expect((error as ConfigValidationError).path).toBe('name');
      }
    });
  });

  describe('invalid field formats', () => {
    it('throws when name is empty', () => {
      expect(() =>
        defineConfig({
          name: '',
          main: 'src/index.ts',
          compatibility_date: '2024-01-01',
        }),
      ).toThrow(ConfigValidationError);
    });

    it('throws when name exceeds 64 characters', () => {
      expect(() =>
        defineConfig({
          name: 'a'.repeat(65),
          main: 'src/index.ts',
          compatibility_date: '2024-01-01',
        }),
      ).toThrow(ConfigValidationError);
    });

    it('throws when main does not end with .ts or .js', () => {
      expect(() =>
        defineConfig({
          name: 'my-worker',
          main: 'src/index.jsx',
          compatibility_date: '2024-01-01',
        }),
      ).toThrow(ConfigValidationError);
    });

    it('throws when compatibility_date has invalid format', () => {
      expect(() =>
        defineConfig({
          name: 'my-worker',
          main: 'src/index.ts',
          compatibility_date: '2024/01/01',
        }),
      ).toThrow(ConfigValidationError);
    });

    it('throws when compatibility_date is not a date', () => {
      expect(() =>
        defineConfig({
          name: 'my-worker',
          main: 'src/index.ts',
          compatibility_date: 'invalid-date',
        }),
      ).toThrow(ConfigValidationError);
    });
  });

  describe('with bindings', () => {
    it('accepts multiple bindings', () => {
      const config = defineConfig({
        name: 'my-worker',
        main: 'src/index.ts',
        compatibility_date: '2024-01-01',
        bindings: [
          d1Binding('DB', 'my-db', 'db-id'),
          kvBinding('CACHE', 'kv-id'),
        ],
      });

      expect(config.bindings).toHaveLength(2);
      expect(config.bindings![0].type).toBe('d1');
      expect(config.bindings![1].type).toBe('kv');
    });
  });
});
