/**
 * TOML file generator
 */

import { stringify } from '@ltd/j-toml';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Binding } from '../types/bindings.js';
import type { WranglerConfig } from '../types/config.js';

/**
 * Generation options
 */
export interface GenerateOptions {
  /**
   * Preserve existing comments (default: false)
   */
  preserveComments?: boolean;

  /**
   * Formatting style (default: 'pretty')
   */
  format?: 'compact' | 'pretty';

  /**
   * Generate for specific environment
   */
  environment?: string;
}

/**
 * Generation error
 */
export class GenerationError extends Error {
  constructor(
    message: string,
    public config: WranglerConfig,
    public format: 'toml' | 'jsonc',
  ) {
    super(message);
    this.name = 'GenerationError';
  }
}

/**
 * Convert binding to wrangler.toml format
 */
function bindingToTOML(binding: Binding): Record<string, unknown> {
  switch (binding.type) {
    case 'd1':
      return {
        binding: binding.binding,
        database_name: binding.database_name,
        database_id: binding.database_id,
      };
    case 'kv':
      return {
        binding: binding.binding,
        id: binding.id,
      };
    case 'r2':
      return {
        binding: binding.binding,
        bucket_name: binding.bucket_name,
      };
    case 'do':
      return {
        binding: binding.binding,
        class_name: binding.class_name,
        ...(binding.script_name && { script_name: binding.script_name }),
      };
    case 'service':
      return {
        binding: binding.binding,
        service: binding.service,
        ...(binding.environment && { environment: binding.environment }),
      };
    case 'analytics_engine':
      return {
        binding: binding.binding,
        dataset: binding.dataset,
      };
    case 'queue':
      return {
        binding: binding.binding,
        queue: binding.queue_name,
      };
    case 'hyperdrive':
      return {
        binding: binding.binding,
        id: binding.id,
        ...(binding.localConnectionString && { localConnectionString: binding.localConnectionString }),
      };
    case 'ai':
      return {
        binding: binding.binding,
      };
    case 'workflows':
      return {
        binding: binding.binding,
        class_name: binding.class_name,
        ...(binding.script_name && { script_name: binding.script_name }),
      };
  }
}

/**
 * Convert WranglerConfig to TOML-compatible object
 */
function configToTOMLObject(config: WranglerConfig): Record<string, unknown> {
  const obj: Record<string, unknown> = {
    name: config.name,
    main: config.main,
    compatibility_date: config.compatibility_date,
  };

  // Optional fields
  if (config.accountId) {
    obj['account_id'] = config.accountId;
  }

  if (config.compatibility_flags && config.compatibility_flags.length > 0) {
    obj['compatibility_flags'] = config.compatibility_flags;
  }

  if (config.node_compat) {
    obj['node_compat'] = config.node_compat;
  }

  if (config.vars && Object.keys(config.vars).length > 0) {
    obj['vars'] = config.vars;
  }

  // Bindings (grouped by type)
  if (config.bindings && config.bindings.length > 0) {
    const d1Bindings = config.bindings.filter((b) => b.type === 'd1');
    const kvBindings = config.bindings.filter((b) => b.type === 'kv');
    const r2Bindings = config.bindings.filter((b) => b.type === 'r2');
    const doBindings = config.bindings.filter((b) => b.type === 'do');
    const serviceBindings = config.bindings.filter((b) => b.type === 'service');
    const aeBindings = config.bindings.filter((b) => b.type === 'analytics_engine');
    const queueBindings = config.bindings.filter((b) => b.type === 'queue');
    const hyperdriveBindings = config.bindings.filter((b) => b.type === 'hyperdrive');
    const aiBindings = config.bindings.filter((b) => b.type === 'ai');
    const workflowsBindings = config.bindings.filter((b) => b.type === 'workflows');

    if (d1Bindings.length > 0) {
      obj['d1_databases'] = d1Bindings.map(bindingToTOML);
    }

    if (kvBindings.length > 0) {
      obj['kv_namespaces'] = kvBindings.map(bindingToTOML);
    }

    if (r2Bindings.length > 0) {
      obj['r2_buckets'] = r2Bindings.map(bindingToTOML);
    }

    if (doBindings.length > 0) {
      obj['durable_objects'] = { bindings: doBindings.map(bindingToTOML) };
    }

    if (serviceBindings.length > 0) {
      obj['services'] = serviceBindings.map(bindingToTOML);
    }

    if (aeBindings.length > 0) {
      obj['analytics_engine_datasets'] = aeBindings.map(bindingToTOML);
    }

    if (queueBindings.length > 0) {
      obj['queues'] = { producers: queueBindings.map(bindingToTOML) };
    }

    if (hyperdriveBindings.length > 0) {
      obj['hyperdrive'] = hyperdriveBindings.map(bindingToTOML);
    }

    if (aiBindings.length > 0) {
      obj['ai'] = aiBindings.map(bindingToTOML);
    }

    if (workflowsBindings.length > 0) {
      obj['workflows'] = workflowsBindings.map(bindingToTOML);
    }
  }

  // Routes
  if (config.routes && config.routes.length > 0) {
    obj['routes'] = config.routes;
  }

  // Triggers
  if (config.triggers) {
    if (config.triggers.crons && config.triggers.crons.length > 0) {
      obj['triggers'] = { crons: config.triggers.crons };
    }
    if (config.triggers.queues && config.triggers.queues.length > 0) {
      obj['queues'] = { consumers: config.triggers.queues };
    }
  }

  // Don't include env in the main object - will be handled separately
  // to allow proper [[env.NAME.binding]] syntax

  return obj;
}

/**
 * Generate wrangler.toml content from configuration
 *
 * @param config - Wrangler configuration
 * @param options - Generation options
 * @returns TOML string
 * @throws GenerationError if generation fails
 *
 * @example
 * ```ts
 * const toml = generateTOML(config);
 * console.log(toml);
 * // Output:
 * // name = "my-worker"
 * // main = "src/index.ts"
 * // ...
 * ```
 */
/**
 * Serialize array-of-tables binding section
 */
function serializeBindingSection(sectionName: string, bindings: Record<string, unknown>[]): string {
  return bindings
    .map((binding) => {
      const lines = [`[[${sectionName}]]`];
      for (const [key, value] of Object.entries(binding)) {
        if (typeof value === 'string') {
          lines.push(`${key} = '${value}'`);
        } else if (typeof value === 'number' || typeof value === 'boolean') {
          lines.push(`${key} = ${value}`);
        }
      }
      return lines.join('\n');
    })
    .join('\n\n');
}

export function generateTOML(config: WranglerConfig, options?: GenerateOptions): string {
  try {
    const obj = configToTOMLObject(config);
    
    // Extract bindings to handle separately
    const d1Bindings = obj['d1_databases'] as Record<string, unknown>[] | undefined;
    const kvBindings = obj['kv_namespaces'] as Record<string, unknown>[] | undefined;
    const r2Bindings = obj['r2_buckets'] as Record<string, unknown>[] | undefined;
    const hyperdriveBindings = obj['hyperdrive'] as Record<string, unknown>[] | undefined;
    const aiBindings = obj['ai'] as Record<string, unknown>[] | undefined;
    const workflowsBindings = obj['workflows'] as Record<string, unknown>[] | undefined;
    const servicesBindings = obj['services'] as Record<string, unknown>[] | undefined;
    const aeBindings = obj['analytics_engine_datasets'] as Record<string, unknown>[] | undefined;
    
    // Remove bindings from main object (will add manually)
    delete obj['d1_databases'];
    delete obj['kv_namespaces'];
    delete obj['r2_buckets'];
    delete obj['hyperdrive'];
    delete obj['ai'];
    delete obj['workflows'];
    delete obj['services'];
    delete obj['analytics_engine_datasets'];
    
    // Generate base TOML
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseLines = stringify(obj as any, {
      newline: '\n',
      newlineAround: 'section',
      indent: options?.format === 'compact' ? 0 : 2,
    });
    
    let result = Array.isArray(baseLines) ? baseLines.join('\n') : baseLines;
    
    // Append binding sections with proper [[array]] syntax
    if (d1Bindings && d1Bindings.length > 0) {
      result += '\n\n' + serializeBindingSection('d1_databases', d1Bindings);
    }
    if (kvBindings && kvBindings.length > 0) {
      result += '\n\n' + serializeBindingSection('kv_namespaces', kvBindings);
    }
    if (r2Bindings && r2Bindings.length > 0) {
      result += '\n\n' + serializeBindingSection('r2_buckets', r2Bindings);
    }
    if (hyperdriveBindings && hyperdriveBindings.length > 0) {
      result += '\n\n' + serializeBindingSection('hyperdrive', hyperdriveBindings);
    }
    if (aiBindings && aiBindings.length > 0) {
      result += '\n\n' + serializeBindingSection('ai', aiBindings);
    }
    if (workflowsBindings && workflowsBindings.length > 0) {
      result += '\n\n' + serializeBindingSection('workflows', workflowsBindings);
    }
    if (servicesBindings && servicesBindings.length > 0) {
      result += '\n\n' + serializeBindingSection('services', servicesBindings);
    }
    if (aeBindings && aeBindings.length > 0) {
      result += '\n\n' + serializeBindingSection('analytics_engine_datasets', aeBindings);
    }
    
    // Handle environment-specific configurations
    if (config.env && Object.keys(config.env).length > 0) {
      for (const [envName, envConfig] of Object.entries(config.env)) {
        result += `\n\n[env.${envName}]`;
        if (envConfig.name) {
          result += `\nname = '${envConfig.name}'`;
        }
        if (envConfig.accountId) {
          result += `\naccount_id = '${envConfig.accountId}'`;
        }
        if (envConfig.vars && Object.keys(envConfig.vars).length > 0) {
          result += `\n\n[env.${envName}.vars]`;
          for (const [key, value] of Object.entries(envConfig.vars)) {
            result += `\n${key} = '${value}'`;
          }
        }
        
        // Environment-specific bindings
        if (envConfig.bindings && envConfig.bindings.length > 0) {
          const envD1 = envConfig.bindings.filter((b) => b.type === 'd1').map(bindingToTOML);
          const envKV = envConfig.bindings.filter((b) => b.type === 'kv').map(bindingToTOML);
          const envR2 = envConfig.bindings.filter((b) => b.type === 'r2').map(bindingToTOML);
          const envHyperdrive = envConfig.bindings.filter((b) => b.type === 'hyperdrive').map(bindingToTOML);
          const envAI = envConfig.bindings.filter((b) => b.type === 'ai').map(bindingToTOML);
          const envWorkflows = envConfig.bindings.filter((b) => b.type === 'workflows').map(bindingToTOML);
          
          if (envD1.length > 0) {
            result += '\n\n' + serializeBindingSection(`env.${envName}.d1_databases`, envD1);
          }
          if (envKV.length > 0) {
            result += '\n\n' + serializeBindingSection(`env.${envName}.kv_namespaces`, envKV);
          }
          if (envR2.length > 0) {
            result += '\n\n' + serializeBindingSection(`env.${envName}.r2_buckets`, envR2);
          }
          if (envHyperdrive.length > 0) {
            result += '\n\n' + serializeBindingSection(`env.${envName}.hyperdrive`, envHyperdrive);
          }
          if (envAI.length > 0) {
            result += '\n\n' + serializeBindingSection(`env.${envName}.ai`, envAI);
          }
          if (envWorkflows.length > 0) {
            result += '\n\n' + serializeBindingSection(`env.${envName}.workflows`, envWorkflows);
          }
        }
      }
    }
    
    return result;
  } catch (error) {
    throw new GenerationError(
      `Failed to generate TOML: ${error instanceof Error ? error.message : String(error)}`,
      config,
      'toml',
    );
  }
}

/**
 * Generate and write configuration file to disk
 *
 * @param config - Wrangler configuration
 * @param outputPath - File path to write to
 * @param format - Output format (toml or jsonc)
 * @returns Promise that resolves when file is written
 * @throws GenerationError if generation fails
 * @throws Error if file cannot be written
 *
 * @example
 * ```ts
 * await writeConfigFile(config, './wrangler.toml', 'toml');
 * ```
 */
export async function writeConfigFile(
  config: WranglerConfig,
  outputPath: string,
  format: 'toml' | 'jsonc' = "toml",
): Promise<void> {
  let content: string;

  if (format === 'toml') {
    content = generateTOML(config);
  } else {
    throw new Error('JSONC format not yet implemented');
  }

  // Create parent directories if needed
  const dir = dirname(outputPath);
  await mkdir(dir, { recursive: true });

  // Write file
  await writeFile(outputPath, content, 'utf-8');
}
