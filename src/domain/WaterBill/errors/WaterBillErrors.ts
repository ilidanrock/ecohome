import { DomainError } from '@/src/domain/errors/DomainError';

export class InvalidWaterBillError extends DomainError {
  readonly code = 'INVALID_WATER_BILL';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

export class InvalidPeriodError extends DomainError {
  readonly code = 'INVALID_PERIOD';
  readonly statusCode = 400;

  constructor() {
    super('Period start must be before period end');
  }
}

export class WaterBillNotFoundError extends DomainError {
  readonly code = 'WATER_BILL_NOT_FOUND';
  readonly statusCode = 404;

  constructor(waterBillId: string) {
    super(`Water bill with ID ${waterBillId} not found`);
  }
}

export class WaterBillPropertyMismatchError extends DomainError {
  readonly code = 'WATER_BILL_PROPERTY_MISMATCH';
  readonly statusCode = 400;

  constructor(waterBillId: string, expectedPropertyId: string, actualPropertyId: string) {
    super(
      `Water bill ${waterBillId} belongs to property ${actualPropertyId}, not ${expectedPropertyId}`
    );
  }
}
