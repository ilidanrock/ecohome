import { ErrorCode } from './error-codes';
import type { ErrorLevel } from './types';
import { DomainError } from '@/src/domain/errors/DomainError';

/**
 * Determines error level based on HTTP status code
 */
export function getErrorLevelFromStatus(statusCode: number): ErrorLevel {
  if (statusCode >= 200 && statusCode < 300) {
    return 'success';
  }

  if (statusCode >= 400 && statusCode < 500) {
    return 'error';
  }

  if (statusCode >= 500) {
    return 'error';
  }

  // Default to error for unknown status codes
  return 'error';
}

/**
 * Determines error level from error type
 */
export function getErrorLevelFromError(error: unknown): ErrorLevel {
  if (error instanceof DomainError) {
    // Domain errors are typically client errors (4xx)
    if (error.statusCode >= 400 && error.statusCode < 500) {
      return 'error';
    }
    if (error.statusCode >= 500) {
      return 'error';
    }
    // 2xx status codes would be success, but DomainError shouldn't have those
    return 'error';
  }

  // Default to error for unknown error types
  return 'error';
}

/**
 * Maps HTTP status code to ErrorCode
 */
export function getErrorCodeFromStatus(statusCode: number): ErrorCode {
  switch (statusCode) {
    case 200:
    case 201:
      return ErrorCode.CREATED;
    case 204:
      return ErrorCode.DELETED;
    case 400:
      return ErrorCode.BAD_REQUEST;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 409:
      return ErrorCode.CONFLICT;
    case 413:
      return ErrorCode.PAYLOAD_TOO_LARGE;
    case 429:
      return ErrorCode.RATE_LIMIT_EXCEEDED;
    case 500:
      return ErrorCode.INTERNAL_ERROR;
    case 503:
      return ErrorCode.SERVICE_UNAVAILABLE;
    default:
      if (statusCode >= 200 && statusCode < 300) {
        return ErrorCode.SUCCESS;
      }
      if (statusCode >= 400 && statusCode < 500) {
        return ErrorCode.BAD_REQUEST;
      }
      return ErrorCode.INTERNAL_ERROR;
  }
}

/**
 * Determines if an error code represents a success
 */
export function isSuccessCode(code: string | ErrorCode): boolean {
  const codeStr = String(code);
  return (
    codeStr === ErrorCode.SUCCESS ||
    codeStr === ErrorCode.CREATED ||
    codeStr === ErrorCode.UPDATED ||
    codeStr === ErrorCode.DELETED
  );
}
