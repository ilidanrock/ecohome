export class Rental {
  id: string;
  userId: string;
  propertyId: string;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;

  constructor(
    userId: string,
    propertyId: string,
    startDate: Date,
    endDate: Date | null,
    createdAt: Date,
    updatedAt: Date,
    id?: string,
    deletedAt?: Date | null,
    createdById?: string | null,
    updatedById?: string | null,
    deletedById?: string | null
  ) {
    this.id = id || '';
    this.userId = userId;
    this.propertyId = propertyId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt ?? null;
    this.createdById = createdById ?? null;
    this.updatedById = updatedById ?? null;
    this.deletedById = deletedById ?? null;
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
