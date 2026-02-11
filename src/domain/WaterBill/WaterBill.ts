import { InvalidWaterBillError, InvalidPeriodError } from './errors/WaterBillErrors';

export class WaterBill {
  id: string;
  propertyId: string;
  periodStart: Date;
  periodEnd: Date;
  totalConsumption: number; // m³
  totalCost: number;
  fileUrl: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    propertyId: string,
    periodStart: Date,
    periodEnd: Date,
    totalConsumption: number,
    totalCost: number,
    fileUrl: string | null,
    createdAt: Date,
    updatedAt: Date,
    id?: string
  ) {
    // Validaciones básicas
    if (totalConsumption <= 0) {
      throw new InvalidWaterBillError('Total consumption must be greater than zero');
    }
    if (totalCost <= 0) {
      throw new InvalidWaterBillError('Total cost must be greater than zero');
    }
    if (periodStart >= periodEnd) {
      throw new InvalidPeriodError();
    }

    this.id = id || '';
    this.propertyId = propertyId;
    this.periodStart = periodStart;
    this.periodEnd = periodEnd;
    this.totalConsumption = totalConsumption;
    this.totalCost = totalCost;
    this.fileUrl = fileUrl;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Calcula el costo por m³
   * @returns Costo por m³
   */
  public getCostPerCubicMeter(): number {
    return this.totalCost / this.totalConsumption;
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
   * @param other - Otro WaterBill
   * @returns true si los períodos se solapan
   */
  public overlapsWith(other: WaterBill): boolean {
    return this.periodStart <= other.periodEnd && this.periodEnd >= other.periodStart;
  }
}
