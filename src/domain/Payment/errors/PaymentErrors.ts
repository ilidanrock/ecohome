import { DomainError } from '@/src/domain/errors/DomainError';

/**
 * Error thrown when payment amount is invalid
 */
export class InvalidPaymentAmountError extends DomainError {
  readonly code = 'INVALID_PAYMENT_AMOUNT';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

/**
 * Error thrown when payment date is invalid
 */
export class InvalidPaymentDateError extends DomainError {
  readonly code = 'INVALID_PAYMENT_DATE';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

/**
 * Error thrown when payment reference is invalid
 */
export class InvalidPaymentReferenceError extends DomainError {
  readonly code = 'INVALID_PAYMENT_REFERENCE';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

/**
 * Error thrown when payment receipt URL is invalid
 */
export class InvalidPaymentReceiptUrlError extends DomainError {
  readonly code = 'INVALID_PAYMENT_RECEIPT_URL';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

/**
 * Error thrown when payment relationship is invalid
 */
export class InvalidPaymentRelationshipError extends DomainError {
  readonly code = 'INVALID_PAYMENT_RELATIONSHIP';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

/**
 * Error thrown when payment is not found
 */
export class PaymentNotFoundError extends DomainError {
  readonly code = 'PAYMENT_NOT_FOUND';
  readonly statusCode = 404;

  constructor(message: string = 'Payment not found') {
    super(message);
  }
}
