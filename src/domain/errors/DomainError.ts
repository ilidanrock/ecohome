import type { ErrorResponse } from '@/lib/errors/types';
import { ErrorCode } from '@/lib/errors/error-codes';
import { getErrorCodeFromStatus, getErrorLevelFromStatus } from '@/lib/errors/error-level';

/**
 * Abstract base class for domain errors
 * Provides a consistent structure for domain-level error handling
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Capture stack trace if available
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert DomainError to ErrorResponse
   * Maps domain error code to standard ErrorCode and determines error level
   */
  toErrorResponse(errorId?: string): ErrorResponse {
    // Map domain error code to standard ErrorCode
    const standardCode = this.mapCodeToErrorCode();
    const level = getErrorLevelFromStatus(this.statusCode);

    return {
      code: standardCode,
      message: this.message,
      level,
      errorId,
      details: {
        domainCode: this.code,
        statusCode: this.statusCode,
      },
    };
  }

  /**
   * Map domain-specific error code to standard ErrorCode
   * Override this method in subclasses for custom mapping
   */
  protected mapCodeToErrorCode(): ErrorCode {
    // Default mapping based on status code
    return getErrorCodeFromStatus(this.statusCode);
  }
}
