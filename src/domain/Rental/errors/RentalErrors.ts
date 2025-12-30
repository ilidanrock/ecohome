import { DomainError } from '@/src/domain/errors/DomainError';

/**
 * Error thrown when a rental is not found
 */
export class RentalNotFoundError extends DomainError {
  readonly code = 'RENTAL_NOT_FOUND';
  readonly statusCode = 404;

  constructor(rentalId: string) {
    super(`Rental with ID ${rentalId} not found`);
  }
}

/**
 * Error thrown when user doesn't have permission to access a rental
 */
export class RentalAccessDeniedError extends DomainError {
  readonly code = 'RENTAL_ACCESS_DENIED';
  readonly statusCode = 403;

  constructor(message: string = 'You do not have permission to access this rental') {
    super(message);
  }
}
