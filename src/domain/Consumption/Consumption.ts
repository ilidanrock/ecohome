export class Consumption {
  id: string;
  rentalId: string;
  month: number;
  year: number;
  previousReading: number | null;
  energyReading: number;
  meterImageUrl: string | null;
  ocrExtracted: boolean;
  ocrConfidence: number | null;
  ocrRawText: string | null;
  extractedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;

  constructor(
    rentalId: string,
    month: number,
    year: number,
    energyReading: number,
    meterImageUrl: string | null,
    extractedAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
    id?: string,
    previousReading?: number | null,
    ocrExtracted?: boolean,
    ocrConfidence?: number | null,
    ocrRawText?: string | null,
    deletedAt?: Date | null,
    createdById?: string | null,
    updatedById?: string | null,
    deletedById?: string | null
  ) {
    this.id = id || '';
    this.rentalId = rentalId;
    this.month = month;
    this.year = year;
    this.previousReading = previousReading ?? null;
    this.energyReading = energyReading;
    this.meterImageUrl = meterImageUrl;
    this.ocrExtracted = ocrExtracted ?? false;
    this.ocrConfidence = ocrConfidence ?? null;
    this.ocrRawText = ocrRawText ?? null;
    this.extractedAt = extractedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt ?? null;
    this.createdById = createdById ?? null;
    this.updatedById = updatedById ?? null;
    this.deletedById = deletedById ?? null;
  }

  public getEnergyReading(): number {
    return this.energyReading;
  }

  public getMonth(): number {
    return this.month;
  }

  public getYear(): number {
    return this.year;
  }

  public getRentalId(): string {
    return this.rentalId;
  }

  public getPreviousReading(): number | null {
    return this.previousReading;
  }

  /**
   * Calcula el consumo del período basado en la lectura actual y la anterior
   * @returns El consumo del período en kWh
   */
  public getConsumptionForPeriod(): number {
    if (!this.previousReading) {
      return this.energyReading; // Si no hay lectura anterior, usar la actual
    }
    return Math.max(this.energyReading - this.previousReading, 0);
  }
}
