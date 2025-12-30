/**
 * Error Codes Enum
 *
 * Centralized error codes for consistent error handling across the application.
 * Codes are categorized by HTTP status ranges and error types.
 */
export enum ErrorCode {
  // Success codes (2xx)
  SUCCESS = 'SUCCESS',
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',

  // Client errors (4xx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  PAYLOAD_TOO_LARGE = 'PAYLOAD_TOO_LARGE',
  BAD_REQUEST = 'BAD_REQUEST',

  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Advisory codes
  WARNING = 'WARNING',
  INFO = 'INFO',
  PARTIAL_SUCCESS = 'PARTIAL_SUCCESS',
}
