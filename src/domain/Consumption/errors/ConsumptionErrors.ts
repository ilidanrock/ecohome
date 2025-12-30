import { DomainError } from '@/src/domain/errors/DomainError';

/**
 * Error thrown when a consumption record is not found
 */
export class ConsumptionNotFoundError extends DomainError {
  readonly code = 'CONSUMPTION_NOT_FOUND';
  readonly statusCode = 404;

  constructor(consumptionId: string) {
    super(`Consumption with ID ${consumptionId} not found`);
  }
}

/**
 * Error thrown when energy reading is invalid (not positive)
 */
export class InvalidEnergyReadingError extends DomainError {
  readonly code = 'INVALID_ENERGY_READING';
  readonly statusCode = 400;

  constructor(message: string = 'Energy reading must be positive') {
    super(message);
  }
}

/**
 * Error thrown when energy reading value is too high
 */
export class EnergyReadingTooHighError extends DomainError {
  readonly code = 'ENERGY_READING_TOO_HIGH';
  readonly statusCode = 400;

  constructor(maxValue: number = 10000000) {
    super(`Energy reading value too high (max ${maxValue} kWh)`);
  }
}

/**
 * Error thrown when previous reading is invalid
 */
export class InvalidPreviousReadingError extends DomainError {
  readonly code = 'INVALID_PREVIOUS_READING';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}
