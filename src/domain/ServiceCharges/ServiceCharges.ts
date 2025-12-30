import { DomainError } from '@/src/domain/errors/DomainError';

export class InvalidServiceChargeError extends DomainError {
  readonly code = 'INVALID_SERVICE_CHARGE';
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

export class ServiceCharges {
  id: string;
  electricityBillId: string;

  // Servicios antes de IGV
  maintenanceAndReplacement: number; // Reposición y mantenimiento
  fixedCharge: number; // Cargo fijo
  compensatoryInterest: number; // Interés compensatorio
  publicLighting: number; // Alumbrado público

  // Servicios después de IGV
  lawContribution: number; // Aporte Ley N° 28749
  lateFee: number; // Recargo por mora
  previousMonthRounding: number; // Redondeo Mes Anterior
  currentMonthRounding: number; // Redondeo Mes Actual

  createdAt: Date;
  updatedAt: Date;

  constructor(
    electricityBillId: string,
    maintenanceAndReplacement: number,
    fixedCharge: number,
    compensatoryInterest: number,
    publicLighting: number,
    lawContribution: number,
    lateFee: number,
    previousMonthRounding: number,
    currentMonthRounding: number,
    createdAt: Date,
    updatedAt: Date,
    id?: string
  ) {
    // Validaciones básicas
    if (maintenanceAndReplacement < 0) {
      throw new InvalidServiceChargeError('Maintenance and replacement must be non-negative');
    }
    if (fixedCharge < 0) {
      throw new InvalidServiceChargeError('Fixed charge must be non-negative');
    }
    if (compensatoryInterest < 0) {
      throw new InvalidServiceChargeError('Compensatory interest must be non-negative');
    }
    if (publicLighting < 0) {
      throw new InvalidServiceChargeError('Public lighting must be non-negative');
    }
    if (lawContribution < 0) {
      throw new InvalidServiceChargeError('Law contribution must be non-negative');
    }
    if (lateFee < 0) {
      throw new InvalidServiceChargeError('Late fee must be non-negative');
    }

    this.id = id || '';
    this.electricityBillId = electricityBillId;
    this.maintenanceAndReplacement = maintenanceAndReplacement;
    this.fixedCharge = fixedCharge;
    this.compensatoryInterest = compensatoryInterest;
    this.publicLighting = publicLighting;
    this.lawContribution = lawContribution;
    this.lateFee = lateFee;
    this.previousMonthRounding = previousMonthRounding;
    this.currentMonthRounding = currentMonthRounding;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Calcula el total de servicios antes de IGV
   * @returns Total de servicios antes de IGV
   */
  public getTotalBeforeIGV(): number {
    return (
      this.maintenanceAndReplacement +
      this.fixedCharge +
      this.compensatoryInterest +
      this.publicLighting
    );
  }

  /**
   * Calcula el total de servicios después de IGV
   * @returns Total de servicios después de IGV
   */
  public getTotalAfterIGV(): number {
    return (
      this.lawContribution + this.lateFee + this.previousMonthRounding + this.currentMonthRounding
    );
  }

  /**
   * Calcula el total de todos los servicios
   * @returns Total de servicios (antes + después de IGV)
   */
  public getTotal(): number {
    return this.getTotalBeforeIGV() + this.getTotalAfterIGV();
  }

  /**
   * Calcula el total de servicios antes de IGV por persona
   * @param numberOfPeople - Número de personas
   * @returns Total de servicios antes de IGV dividido por número de personas
   */
  public getTotalBeforeIGVPerPerson(numberOfPeople: number): number {
    if (numberOfPeople <= 0) {
      throw new InvalidNumberOfPeopleError();
    }
    return this.getTotalBeforeIGV() / numberOfPeople;
  }

  /**
   * Calcula el total de servicios después de IGV por persona
   * @param numberOfPeople - Número de personas
   * @returns Total de servicios después de IGV dividido por número de personas
   */
  public getTotalAfterIGVPerPerson(numberOfPeople: number): number {
    if (numberOfPeople <= 0) {
      throw new InvalidNumberOfPeopleError();
    }
    return this.getTotalAfterIGV() / numberOfPeople;
  }
}
