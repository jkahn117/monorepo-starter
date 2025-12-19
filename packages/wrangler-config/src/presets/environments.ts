/**
 * Pre-configured environment profiles
 */

import { defineEnvironment } from '../builders/environment.js';
import type { EnvironmentConfig } from '../types/environment.js';

/**
 * Standard environment profiles with common configurations
 */
export const environments: Record<string, EnvironmentConfig> = {
  /**
   * Development environment configuration
   * 
   * Optimized for local development with debug logging
   */
  development: defineEnvironment('development', {
    vars: {
      LOG_LEVEL: 'debug',
      NODE_ENV: 'development',
    },
  }),

  /**
   * Staging environment configuration
   * 
   * Pre-production environment with info-level logging
   */
  staging: defineEnvironment('staging', {
    vars: {
      LOG_LEVEL: 'info',
      NODE_ENV: 'staging',
    },
  }),

  /**
   * Production environment configuration
   * 
   * Production-optimized with warning-level logging
   */
  production: defineEnvironment('production', {
    vars: {
      LOG_LEVEL: 'warn',
      NODE_ENV: 'production',
    },
  }),
};
