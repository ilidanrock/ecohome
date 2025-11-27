export class Rental {
  id: string;
  userId: string;
  propertyId: string;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    userId: string,
    propertyId: string,
    startDate: Date,
    endDate: Date | null,
    createdAt: Date,
    updatedAt: Date,
    id?: string
  ) {
    this.id = id || '';
    this.userId = userId;
    this.propertyId = propertyId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getPropertyId(): string {
    return this.propertyId;
  }

  public getStartDate(): Date {
    return this.startDate;
  }

  public getEndDate(): Date | null {
    return this.endDate;
  }

  public isActive(): boolean {
    const now = new Date();
    return this.startDate <= now && (this.endDate === null || this.endDate >= now);
  }
}
