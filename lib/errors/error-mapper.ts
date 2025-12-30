import { ErrorCode } from './error-codes';
import type { ErrorLevel } from './types';

/**
 * Maps error codes to error levels
 */
export function getErrorLevel(code: string | ErrorCode): ErrorLevel {
  const codeStr = String(code);

  // Success codes
  if (
    [ErrorCode.SUCCESS, ErrorCode.CREATED, ErrorCode.UPDATED, ErrorCode.DELETED].includes(
      codeStr as ErrorCode
    )
  ) {
    return 'success';
  }

  // Advisory codes
  if (
    [ErrorCode.WARNING, ErrorCode.INFO, ErrorCode.PARTIAL_SUCCESS].includes(codeStr as ErrorCode)
  ) {
    return 'advisory';
  }

  // All other codes are errors
  return 'error';
}

/**
 * Maps error level to Sonner toast type
 */
export function getToastType(level: ErrorLevel): 'success' | 'error' | 'warning' | 'info' {
  switch (level) {
    case 'success':
      return 'success';
    case 'error':
      return 'error';
    case 'advisory':
      return 'warning'; // Default advisory to warning, can be overridden
    default:
      return 'error';
  }
}

/**
 * Maps error code to Sonner toast type directly
 */
export function getToastTypeFromCode(
  code: string | ErrorCode
): 'success' | 'error' | 'warning' | 'info' {
  const level = getErrorLevel(code);

  // Special case: INFO code should use info toast
  if (code === ErrorCode.INFO) {
    return 'info';
  }

  return getToastType(level);
}

/**
 * Gets default duration for toast based on level
 */
export function getToastDuration(level: ErrorLevel): number {
  switch (level) {
    case 'success':
      return 3000; // 3 seconds
    case 'error':
      return 5000; // 5 seconds
    case 'advisory':
      return 4000; // 4 seconds
    default:
      return 4000;
  }
}
