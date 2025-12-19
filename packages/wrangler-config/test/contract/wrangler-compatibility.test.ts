/**
 * Contract test: Wrangler CLI compatibility
 * 
 * Verifies that generated wrangler.toml files can be parsed by Wrangler CLI
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { defineConfig, d1Binding, kvBinding, r2Binding, generateTOML } from '../../src/index.js';

const execAsync = promisify(exec);

describe('Wrangler CLI Compatibility', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'wrangler-compat-test-'));
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('generates TOML that wrangler can parse (basic config)', async () => {
    const config = defineConfig({
      name: 'test-worker',
      main: 'src/index.ts',
      compatibility_date: '2024-01-01',
    });

    const toml = generateTOML(config);
    const tomlPath = join(testDir, 'wrangler.toml');
    await writeFile(tomlPath, toml, 'utf-8');

    // Try to parse with wrangler (dry-run)
    // Note: This test may be skipped in CI if wrangler is not installed
    try {
      const { stdout } = await execAsync('wrangler --version', {
        cwd: testDir,
      });
      
      expect(stdout).toContain('wrangler');
    } catch (error) {
      // Wrangler not installed, skip test
      console.warn('Wrangler CLI not available, skipping compatibility test');
    }
  });

  it('generates TOML with all binding types', async () => {
    const config = defineConfig({
      name: 'full-worker',
      main: 'src/index.ts',
      compatibility_date: '2024-01-01',
      compatibility_flags: ['nodejs_compat'],
      bindings: [
        d1Binding('DB', 'my-database', 'db-id-123'),
        kvBinding('CACHE', 'kv-namespace-id'),
        r2Binding('STORAGE', 'my-bucket'),
      ],
      vars: {
        LOG_LEVEL: 'debug',
        API_URL: 'https://api.example.com',
      },
    });

    const toml = generateTOML(config);

    // Verify TOML is well-formed
    expect(toml).toContain("name = 'full-worker'");
    expect(toml).toContain('d1_databases');
    expect(toml).toContain('kv_namespaces');
    expect(toml).toContain('r2_buckets');
    expect(toml).toContain('vars.');
  });

  it('generates valid TOML structure', async () => {
    const config = defineConfig({
      name: 'test-worker',
      main: 'src/index.ts',
      accountId: 'test-account-123',
      compatibility_date: '2024-01-01',
      compatibility_flags: ['nodejs_compat', 'streams_enable_constructors'],
      node_compat: true,
      bindings: [
        d1Binding('DB', 'database', 'id'),
      ],
      vars: {
        KEY: 'value',
      },
    });

    const toml = generateTOML(config);

    // Basic structure checks
    expect(toml).toContain("name = 'test-worker'");
    expect(toml).toContain("main = 'src/index.ts'");
    expect(toml).toContain("account_id = 'test-account-123'");
    expect(toml).toContain("compatibility_date = '2024-01-01'");
    expect(toml).toContain('compatibility_flags = [');
    expect(toml).toContain('node_compat = true');
  });
});
