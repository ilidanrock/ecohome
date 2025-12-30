/**
 * Server Initialization
 *
 * This module is executed once when the server starts.
 * It validates environment variables and performs other initialization tasks.
 */

import { validateEnv } from './env-validation';
import { logger } from './logger';

// Only validate in server-side code (not in client bundles)
if (typeof window === 'undefined') {
  try {
    validateEnv();
  } catch (error) {
    // Log error but don't crash - let the application start
    // Individual features will fail gracefully if env vars are missing
    logger.error('Environment validation failed', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
