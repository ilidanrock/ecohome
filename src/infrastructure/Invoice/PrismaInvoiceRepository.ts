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
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        rental: includeRental,
      },
    });

    return invoice ? this.mapToDomain(invoice) : null;
  }

  /**
   * Update invoice status and paidAt date
   *
   * @param id - The invoice ID
   * @param status - The new payment status
   * @param paidAt - The date when the invoice was paid
   * @returns The updated invoice entity
   */
  async updateStatus(id: string, status: DomainPaymentStatus, paidAt: Date): Promise<Invoice> {
    const updatedInvoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: status as PaymentStatus,
        paidAt,
      },
    });

    return this.mapToDomain(updatedInvoice);
  }

  /**
   * Update invoice status and paidAt date within a transaction
   *
   * @param id - The invoice ID
   * @param status - The new payment status
   * @param paidAt - The date when the invoice was paid
   * @param tx - The Prisma transaction client
   * @returns The updated invoice entity
   */
  async updateStatusInTransaction(
    id: string,
    status: DomainPaymentStatus,
    paidAt: Date,
    tx: TransactionClient
  ): Promise<Invoice> {
    const transactionClient = tx as Prisma.TransactionClient;
    const updatedInvoice = await transactionClient.invoice.update({
      where: { id },
      data: {
        status: status as PaymentStatus,
        paidAt,
      },
    });

    return this.mapToDomain(updatedInvoice);
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
      Number(prismaInvoice.waterCost), // Convert Decimal to number
      Number(prismaInvoice.energyCost), // Convert Decimal to number
      Number(prismaInvoice.totalCost), // Convert Decimal to number
      prismaInvoice.status,
      prismaInvoice.paidAt,
      prismaInvoice.receiptUrl,
      prismaInvoice.invoiceUrl,
      prismaInvoice.createdAt,
      prismaInvoice.updatedAt,
      prismaInvoice.id,
      rental
    );
  }
}
