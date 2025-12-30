import type { ErrorCode } from './error-codes';

/**
 * Error levels for categorizing errors
 */
export type ErrorLevel = 'success' | 'error' | 'advisory';

/**
 * Standard error response structure
 * Used by both backend and frontend for consistent error handling
 */
export interface ErrorResponse {
  code: string | ErrorCode;
  message: string;
  level: ErrorLevel;
  details?: unknown;
  errorId?: string;
}

/**
 * Configuration for manual toast display
 */
export interface ToastConfig {
  level: ErrorLevel;
  message: string;
  code?: string | ErrorCode;
  duration?: number;
}

/**
 * Extended error response with HTTP status
 */
export interface ApiErrorResponse extends ErrorResponse {
  statusCode?: number;
}
