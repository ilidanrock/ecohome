import { DomainError } from '@/src/domain/errors/DomainError';

/**
 * Error thrown when an invoice is not found
 */
export class InvoiceNotFoundError extends DomainError {
  readonly code = 'INVOICE_NOT_FOUND';
  readonly statusCode = 404;

  constructor(invoiceId: string) {
    super(`Invoice with ID ${invoiceId} not found`);
  }
}

/**
 * Error thrown when user doesn't have permission to access an invoice
 */
export class InvoiceAccessDeniedError extends DomainError {
  readonly code = 'INVOICE_ACCESS_DENIED';
  readonly statusCode = 403;

  constructor(message: string = 'You do not have permission to access this invoice') {
    super(message);
  }
}

/**
 * Error thrown when an electricity bill is not found
 */
export class ElectricityBillNotFoundError extends DomainError {
  readonly code = 'ELECTRICITY_BILL_NOT_FOUND';
  readonly statusCode = 404;

  constructor(billId: string) {
    super(`Electricity bill with ID ${billId} not found`);
  }
}

/**
 * Error thrown when electricity bill doesn't belong to the specified property
 */
export class ElectricityBillPropertyMismatchError extends DomainError {
  readonly code = 'ELECTRICITY_BILL_PROPERTY_MISMATCH';
  readonly statusCode = 400;

  constructor() {
    super('Electricity bill does not belong to the specified property');
  }
}

/**
 * Error thrown when a property is not found
 */
export class PropertyNotFoundError extends DomainError {
  readonly code = 'PROPERTY_NOT_FOUND';
  readonly statusCode = 404;

  constructor(propertyId: string) {
    super(`Property with ID ${propertyId} not found`);
  }
}

/**
 * Error thrown when a property has no administrators
 */
export class PropertyNoAdministratorsError extends DomainError {
  readonly code = 'PROPERTY_NO_ADMINISTRATORS';
  readonly statusCode = 400;

  constructor() {
    super('Property must have at least one administrator');
  }
}
