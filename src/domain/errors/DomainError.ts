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
}
