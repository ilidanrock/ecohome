import { DomainError } from '@/src/domain/errors/DomainError';

export class InvalidWaterServiceChargeError extends DomainError {
  readonly code = 'INVALID_WATER_SERVICE_CHARGE';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

export class InvalidNumberOfPeopleError extends DomainError {
  readonly code = 'INVALID_NUMBER_OF_PEOPLE';
  readonly statusCode = 400;

  constructor() {
    super('Number of people must be greater than zero');
  }
}

export class WaterServiceCharges {
  id: string;
  waterBillId: string;

  fixedCharge: number; // Cargo fijo
  sewerageCharge: number; // Alcantarillado
  lateFee: number; // Recargo por mora
  previousMonthRounding: number; // Redondeo Mes Anterior (puede ser negativo)
  currentMonthRounding: number; // Redondeo Mes Actual (puede ser negativo)

  createdAt: Date;
  updatedAt: Date;

  constructor(
    waterBillId: string,
    fixedCharge: number,
    sewerageCharge: number,
    lateFee: number,
    previousMonthRounding: number,
    currentMonthRounding: number,
    createdAt: Date,
    updatedAt: Date,
    id?: string
  ) {
    // Validaciones básicas (los roundings pueden ser negativos)
    if (fixedCharge < 0) {
      throw new InvalidWaterServiceChargeError('Fixed charge must be non-negative');
    }
    if (sewerageCharge < 0) {
      throw new InvalidWaterServiceChargeError('Sewerage charge must be non-negative');
    }
    if (lateFee < 0) {
      throw new InvalidWaterServiceChargeError('Late fee must be non-negative');
    }

    this.id = id || '';
    this.waterBillId = waterBillId;
    this.fixedCharge = fixedCharge;
    this.sewerageCharge = sewerageCharge;
    this.lateFee = lateFee;
    this.previousMonthRounding = previousMonthRounding;
    this.currentMonthRounding = currentMonthRounding;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Calcula el total de todos los cargos
   * @returns Total de servicios
   */
  public getTotal(): number {
    return (
      this.fixedCharge +
      this.sewerageCharge +
      this.lateFee +
      this.previousMonthRounding +
      this.currentMonthRounding
    );
  }

  /**
   * Calcula el total de cargos por persona
   * @param numberOfPeople - Número de personas
   * @returns Total de servicios dividido por número de personas
   */
  public getTotalPerPerson(numberOfPeople: number): number {
    if (numberOfPeople <= 0) {
      throw new InvalidNumberOfPeopleError();
    }
    return this.getTotal() / numberOfPeople;
  }
}
