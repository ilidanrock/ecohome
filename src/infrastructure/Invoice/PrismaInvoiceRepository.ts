import { PrismaClient, Invoice as PrismaInvoice, PaymentStatus, Prisma } from '@prisma/client';
import {
  IInvoiceRepository,
  type TransactionClient,
} from '@/src/domain/Invoice/IInvoiceRepository';
import { Invoice } from '@/src/domain/Invoice/Invoice';
import { Rental } from '@/src/domain/Rental/Rental';
import type { PaymentStatus as DomainPaymentStatus } from '@/types';

export class PrismaInvoiceRepository implements IInvoiceRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find an invoice by ID
   *
   * @param id - The invoice ID
   * @param includeRental - Whether to include the rental relation
   * @returns The invoice entity or null if not found
   */
  async findById(id: string, includeRental = false): Promise<Invoice | null> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, deletedAt: null },
      include: {
        rental: includeRental,
      },
    });

    return invoice ? this.mapToDomain(invoice) : null;
  }

  async findManyByRentalIds(
    rentalIds: string[],
    options?: { status?: PaymentStatus }
  ): Promise<Invoice[]> {
    if (rentalIds.length === 0) return [];
    const where: Prisma.InvoiceWhereInput = { rentalId: { in: rentalIds }, deletedAt: null };
    if (options?.status) where.status = options.status;
    const invoices = await this.prisma.invoice.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
    return invoices.map((inv) => this.mapToDomain(inv));
  }

  async findByRentalMonthYear(
    rentalId: string,
    month: number,
    year: number
  ): Promise<Invoice | null> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { rentalId, month, year, deletedAt: null },
    });

    return invoice ? this.mapToDomain(invoice) : null;
  }

  async findByRentalMonthYearInTransaction(
    rentalId: string,
    month: number,
    year: number,
    tx: TransactionClient
  ): Promise<Invoice | null> {
    const transactionClient = tx as Prisma.TransactionClient;
    const invoice = await transactionClient.invoice.findFirst({
      where: { rentalId, month, year, deletedAt: null },
    });

    return invoice ? this.mapToDomain(invoice) : null;
  }

  async create(invoice: Invoice, userId: string): Promise<Invoice> {
    const created = await this.prisma.invoice.create({
      data: {
        rentalId: invoice.getRentalId(),
        month: invoice.getMonth(),
        year: invoice.getYear(),
        waterCost: invoice.waterCost,
        energyCost: invoice.energyCost,
        totalCost: invoice.getTotalCost(),
        status: invoice.getStatus() as PaymentStatus,
        paidAt: invoice.paidAt,
        receiptUrl: invoice.receiptUrl,
        invoiceUrl: invoice.invoiceUrl,
        createdById: userId,
        updatedById: userId,
      },
    });

    return this.mapToDomain(created);
  }

  async createInTransaction(
    invoice: Invoice,
    tx: TransactionClient,
    userId: string
  ): Promise<Invoice> {
    const transactionClient = tx as Prisma.TransactionClient;
    const created = await transactionClient.invoice.create({
      data: {
        rentalId: invoice.getRentalId(),
        month: invoice.getMonth(),
        year: invoice.getYear(),
        waterCost: invoice.waterCost,
        energyCost: invoice.energyCost,
        totalCost: invoice.getTotalCost(),
        status: invoice.getStatus() as PaymentStatus,
        paidAt: invoice.paidAt,
        receiptUrl: invoice.receiptUrl,
        invoiceUrl: invoice.invoiceUrl,
        createdById: userId,
        updatedById: userId,
      },
    });

    return this.mapToDomain(created);
  }

  /**
   * Update invoice status and paidAt date
   *
   * @param id - The invoice ID
   * @param status - The new payment status
   * @param paidAt - The date when the invoice was paid
   * @returns The updated invoice entity
   */
  async updateStatus(
    id: string,
    status: DomainPaymentStatus,
    paidAt: Date,
    userId: string
  ): Promise<Invoice> {
    const updatedInvoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: status as PaymentStatus,
        paidAt,
        updatedById: userId,
      },
    });

    return this.mapToDomain(updatedInvoice);
  }

  async updateStatusInTransaction(
    id: string,
    status: DomainPaymentStatus,
    paidAt: Date,
    tx: TransactionClient,
    userId: string
  ): Promise<Invoice> {
    const transactionClient = tx as Prisma.TransactionClient;
    const updatedInvoice = await transactionClient.invoice.update({
      where: { id },
      data: {
        status: status as PaymentStatus,
        paidAt,
        updatedById: userId,
      },
    });

    return this.mapToDomain(updatedInvoice);
  }

  async softDelete(id: string, userId: string): Promise<void> {
    await this.prisma.invoice.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: userId },
    });
  }

  /**
   * Map Prisma Invoice model to domain Invoice entity
   *
   * @param prismaInvoice - The Prisma Invoice model (with optional rental relation)
   * @returns The domain Invoice entity
   */
  private mapToDomain(
    prismaInvoice: PrismaInvoice & { rental?: { userId: string; id: string } }
  ): Invoice {
    const rental = prismaInvoice.rental
      ? new Rental(
          prismaInvoice.rental.userId,
          '', // propertyId not needed for authorization checks
          new Date(), // startDate not needed
          null, // endDate not needed
          new Date(), // createdAt not needed
          new Date(), // updatedAt not needed
          '' // id not needed
        )
      : undefined;

    return new Invoice(
      prismaInvoice.rentalId,
      prismaInvoice.month,
      prismaInvoice.year,
      Number(prismaInvoice.waterCost),
      Number(prismaInvoice.energyCost),
      Number(prismaInvoice.totalCost),
      prismaInvoice.status,
      prismaInvoice.paidAt,
      prismaInvoice.receiptUrl,
      prismaInvoice.invoiceUrl,
      prismaInvoice.createdAt,
      prismaInvoice.updatedAt,
      prismaInvoice.id,
      rental,
      prismaInvoice.deletedAt ?? undefined,
      prismaInvoice.createdById ?? undefined,
      prismaInvoice.updatedById ?? undefined,
      prismaInvoice.deletedById ?? undefined
    );
  }
}
