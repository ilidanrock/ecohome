export class Consumption {
  id: string;
  rentalId: string;
  month: number;
  year: number;
  energyReading: number;
  meterImageUrl: string | null;
  extractedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    rentalId: string,
    month: number,
    year: number,
    energyReading: number,
    meterImageUrl: string | null,
    extractedAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
    id?: string
  ) {
    this.id = id || '';
    this.rentalId = rentalId;
    this.month = month;
    this.year = year;
    this.energyReading = energyReading;
    this.meterImageUrl = meterImageUrl;
    this.extractedAt = extractedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
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
}
