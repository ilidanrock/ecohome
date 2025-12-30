'use client';

import { QueryCache, MutationCache } from '@tanstack/react-query';
import { ToastService } from './toast-service';
import type { ErrorResponse } from './types';
import { ErrorCode } from './error-codes';
import { getErrorCodeFromStatus, getErrorLevelFromStatus } from './error-level';
import { logger } from '@/lib/logger';

/**
 * Extract ErrorResponse from error object
 */
function extractErrorResponse(error: unknown): ErrorResponse | null {
  // Check if error has errorResponse property (from custom error classes)
  if (error && typeof error === 'object' && 'errorResponse' in error) {
    const errorResponse = (error as { errorResponse?: ErrorResponse }).errorResponse;
    if (errorResponse) {
      return errorResponse;
    }
  }

  // Check if error is already an ErrorResponse-like object
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error &&
    'level' in error
  ) {
    return error as ErrorResponse;
  }

  // Check if error has a response property (from fetch)
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: Response }).response;
    if (response) {
      const statusCode = response.status;
      return {
        code: getErrorCodeFromStatus(statusCode),
        message: `Request failed with status ${statusCode}`,
        level: getErrorLevelFromStatus(statusCode),
      };
    }
  }

  // Check if error has statusCode property (from custom error classes)
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode !== undefined) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return {
        code: getErrorCodeFromStatus(statusCode),
        message,
        level: getErrorLevelFromStatus(statusCode),
      };
    }
  }

  // Check if error is a standard Error
  if (error instanceof Error) {
    // Try to extract error info from message
    const message = error.message || 'An error occurred';

    // Check for common error patterns
    if (message.includes('Network') || message.includes('fetch')) {
      return {
        code: ErrorCode.EXTERNAL_SERVICE_ERROR,
        message: 'Network error: Unable to connect to the server',
        level: 'error',
      };
    }

    return {
      code: ErrorCode.INTERNAL_ERROR,
      message,
      level: 'error',
    };
  }

  return null;
}

/**
 * Handle query errors
 */
export function handleQueryError(error: unknown): void {
  const errorResponse = extractErrorResponse(error);

  if (errorResponse) {
    logger.error('Query error intercepted', {
      errorResponse,
      error: error instanceof Error ? error.message : String(error),
    });
    ToastService.show(errorResponse);
  } else {
    // Fallback for unknown errors
    logger.error('Unknown query error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    ToastService.error('An unexpected error occurred', ErrorCode.INTERNAL_ERROR);
  }
}

/**
 * Handle mutation errors
 */
export function handleMutationError(error: unknown): void {
  const errorResponse = extractErrorResponse(error);

  if (errorResponse) {
    logger.error('Mutation error intercepted', {
      errorResponse,
      error: error instanceof Error ? error.message : String(error),
    });
    ToastService.show(errorResponse);
  } else {
    // Fallback for unknown errors
    logger.error('Unknown mutation error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    ToastService.error('An unexpected error occurred', ErrorCode.INTERNAL_ERROR);
  }
}

/**
 * Create query cache with error interceptor
 */
export function createQueryCache(): QueryCache {
  return new QueryCache({
    onError: handleQueryError,
  });
}

/**
 * Create mutation cache with error interceptor
 */
export function createMutationCache(): MutationCache {
  return new MutationCache({
    onError: handleMutationError,
  });
}
