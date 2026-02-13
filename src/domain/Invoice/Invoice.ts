import type { PaymentStatus } from '@/types';
import type { Rental } from '../Rental/Rental';

export class Invoice {
  id: string;
  rentalId: string;
  month: number;
  year: number;
  waterCost: number;
  energyCost: number;
  totalCost: number;
  status: PaymentStatus;
  paidAt: Date | null;
  receiptUrl: string | null;
  invoiceUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;
  rental?: Rental; // Optional rental relation for authorization checks

  constructor(
    rentalId: string,
    month: number,
    year: number,
    waterCost: number,
    energyCost: number,
    totalCost: number,
    status: PaymentStatus,
    paidAt: Date | null,
    receiptUrl: string | null,
    invoiceUrl: string | null,
    createdAt: Date,
    updatedAt: Date,
    id?: string,
    rental?: Rental,
    deletedAt?: Date | null,
    createdById?: string | null,
    updatedById?: string | null,
    deletedById?: string | null
  ) {
    this.id = id || '';
    this.rentalId = rentalId;
    this.month = month;
    this.year = year;
    this.waterCost = waterCost;
    this.energyCost = energyCost;
    this.totalCost = totalCost;
    this.status = status;
    this.paidAt = paidAt;
    this.receiptUrl = receiptUrl;
    this.invoiceUrl = invoiceUrl;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt ?? null;
    this.createdById = createdById ?? null;
    this.updatedById = updatedById ?? null;
    this.deletedById = deletedById ?? null;
    this.rental = rental;
  }

  public getRentalId(): string {
    return this.rentalId;
  }

  public getTotalCost(): number {
    return this.totalCost;
  }

  public getStatus(): PaymentStatus {
    return this.status;
  }

  public isPaid(): boolean {
    return this.status === 'PAID';
  }

  public getRental(): Rental | undefined {
    return this.rental;
  }

  public getMonth(): number {
    return this.month;
  }

  public getYear(): number {
    return this.year;
  }
}
