/**
 * Environment Variables Validation
 *
 * Validates required environment variables at application startup.
 * Throws an error if any required variables are missing.
 */

import { logger } from '@/lib/logger';

/**
 * Required environment variables for the application
 */
const REQUIRED_ENV_VARS = ['DATABASE_URL', 'AUTH_SECRET', 'NEXTAUTH_URL'] as const;

/**
 * Optional environment variables (with warnings if missing)
 */
const OPTIONAL_ENV_VARS = [
  'OPENAI_API_KEY',
  'AUTH_GOOGLE_ID',
  'AUTH_GOOGLE_SECRET',
  'CLOUDINARY_API_SECRET',
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'NEXT_PUBLIC_CLOUDINARY_API_KEY',
  'NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET',
] as const;

/**
 * Validate required environment variables
 * @throws Error if any required variables are missing
 */
export function validateRequiredEnv(): void {
  const missing: string[] = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env.local file and ensure all required variables are set.'
    );
  }
}

/**
 * Validate optional environment variables and log warnings
 * This is useful for features that may not be enabled in all environments
 */
export function validateOptionalEnv(): void {
  // Only log warnings in non-test environments
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  for (const envVar of OPTIONAL_ENV_VARS) {
    if (!process.env[envVar]) {
      logger.warn(
        `Optional environment variable ${envVar} is not set. Related features may not work.`
      );
    }
  }
}

/**
 * Validate all environment variables (required and optional)
 * Call this at application startup
 */
export function validateEnv(): void {
  validateRequiredEnv();
  validateOptionalEnv();
}
