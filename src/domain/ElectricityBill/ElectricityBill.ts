import { DomainError } from '@/src/domain/errors/DomainError';

export class InvalidElectricityBillError extends DomainError {
  readonly code = 'INVALID_ELECTRICITY_BILL';
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

export class ElectricityBill {
  id: string;
  propertyId: string;
  periodStart: Date;
  periodEnd: Date;
  totalKWh: number;
  totalCost: number;
  fileUrl: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    propertyId: string,
    periodStart: Date,
    periodEnd: Date,
    totalKWh: number,
    totalCost: number,
    fileUrl: string | null,
    createdAt: Date,
    updatedAt: Date,
    id?: string
  ) {
    // Validaciones básicas
    if (totalKWh <= 0) {
      throw new InvalidElectricityBillError('Total kWh must be greater than zero');
    }
    if (totalCost <= 0) {
      throw new InvalidElectricityBillError('Total cost must be greater than zero');
    }
    if (periodStart >= periodEnd) {
      throw new InvalidPeriodError();
    }

    this.id = id || '';
    this.propertyId = propertyId;
    this.periodStart = periodStart;
    this.periodEnd = periodEnd;
    this.totalKWh = totalKWh;
    this.totalCost = totalCost;
    this.fileUrl = fileUrl;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Calcula el costo por kWh
   * @returns Costo por kWh
   */
  public getCostPerKWh(): number {
    return this.totalCost / this.totalKWh;
  }

  /**
   * Obtiene el mes del período (usando periodStart)
   * @returns Número del mes (1-12)
   */
  public getMonth(): number {
    return this.periodStart.getMonth() + 1;
  }

  /**
   * Obtiene el año del período (usando periodStart)
   * @returns Año
   */
  public getYear(): number {
    return this.periodStart.getFullYear();
  }

  /**
   * Verifica si el período incluye una fecha específica
   * @param date - Fecha a verificar
   * @returns true si la fecha está dentro del período
   */
  public includesDate(date: Date): boolean {
    return date >= this.periodStart && date <= this.periodEnd;
  }

  /**
   * Verifica si el período se solapa con otro período
   * @param other - Otro ElectricityBill
   * @returns true si los períodos se solapan
   */
  public overlapsWith(other: ElectricityBill): boolean {
    return this.periodStart <= other.periodEnd && this.periodEnd >= other.periodStart;
  }
}
