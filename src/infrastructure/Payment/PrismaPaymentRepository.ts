import { PrismaClient, Payment as PrismaPayment, Prisma } from '@prisma/client';
import {
  IPaymentRepository,
  type TransactionClient,
} from '@/src/domain/Payment/IPaymentRepository';
import { Payment } from '@/src/domain/Payment/Payment';

export class PrismaPaymentRepository implements IPaymentRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new payment
   *
   * @param payment - The payment entity to create
   * @returns The created payment entity
   */
  async create(payment: Payment, userId: string): Promise<Payment> {
    const prismaPayment = await this.prisma.payment.create({
      data: {
        amount: payment.getAmount(),
        paidAt: payment.getPaidAt(),
        paymentMethod: payment.getPaymentMethod(),
        rentalId: payment.getRentalId() || undefined,
        invoiceId: payment.getInvoiceId() || undefined,
        reference: payment.getReference() || undefined,
        receiptUrl: payment.getReceiptUrl() || undefined,
        createdById: userId,
        updatedById: userId,
      },
    });

    return this.mapToDomain(prismaPayment);
  }

  async findById(id: string): Promise<Payment | null> {
    const prismaPayment = await this.prisma.payment.findFirst({
      where: { id, deletedAt: null },
    });

    return prismaPayment ? this.mapToDomain(prismaPayment) : null;
  }

  async findByRentalId(rentalId: string): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: { rentalId, deletedAt: null },
      orderBy: {
        paidAt: 'desc',
      },
      take: 100, // Limit to prevent loading excessive data
    });

    return payments.map((payment) => this.mapToDomain(payment));
  }

  /**
   * Find all payments for a specific invoice
   *
   * Performance optimization: Limited to 100 most recent records for consistency
   * with findByRentalId. Adjust limit based on business requirements if needed.
   *
   * @param invoiceId - The invoice ID
   * @returns Array of Payment entities (max 100, most recent first)
   */
  async findByInvoiceId(invoiceId: string): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: { invoiceId, deletedAt: null },
      orderBy: {
        paidAt: 'desc',
      },
      take: 100, // Limit to prevent loading excessive data
    });

    return payments.map((payment) => this.mapToDomain(payment));
  }

  /**
   * Find all payments for a specific invoice within a transaction
   *
   * @param invoiceId - The invoice ID
   * @param tx - The Prisma transaction client
   * @returns Array of Payment entities ordered by paidAt descending
   */
  async findByInvoiceIdInTransaction(invoiceId: string, tx: TransactionClient): Promise<Payment[]> {
    const transactionClient = tx as Prisma.TransactionClient;
    const payments = await transactionClient.payment.findMany({
      where: { invoiceId, deletedAt: null },
      orderBy: {
        paidAt: 'desc',
      },
    });

    return payments.map((payment) => this.mapToDomain(payment));
  }

  /**
   * Create a new payment within a transaction
   *
   * @param payment - The payment entity to create
   * @param tx - The Prisma transaction client
   * @returns The created payment entity
   */
  async createInTransaction(
    payment: Payment,
    tx: TransactionClient,
    userId: string
  ): Promise<Payment> {
    const transactionClient = tx as Prisma.TransactionClient;
    const prismaPayment = await transactionClient.payment.create({
      data: {
        amount: payment.getAmount(),
        paidAt: payment.getPaidAt(),
        paymentMethod: payment.getPaymentMethod(),
        rentalId: payment.getRentalId() || undefined,
        invoiceId: payment.getInvoiceId() || undefined,
        reference: payment.getReference() || undefined,
        receiptUrl: payment.getReceiptUrl() || undefined,
        createdById: userId,
        updatedById: userId,
      },
    });

    return this.mapToDomain(prismaPayment);
  }

  async update(id: string, payment: Partial<Payment>, userId: string): Promise<Payment> {
    const updateData: {
      amount?: number;
      paidAt?: Date;
      paymentMethod?: Payment['paymentMethod'];
      reference?: string | null;
      receiptUrl?: string | null;
      updatedById?: string;
    } = {};

    if (payment.amount !== undefined) updateData.amount = payment.amount;
    if (payment.paidAt !== undefined) updateData.paidAt = payment.paidAt;
    if (payment.paymentMethod !== undefined) updateData.paymentMethod = payment.paymentMethod;
    if (payment.reference !== undefined) updateData.reference = payment.reference;
    if (payment.receiptUrl !== undefined) updateData.receiptUrl = payment.receiptUrl;
    updateData.updatedById = userId;

    const prismaPayment = await this.prisma.payment.update({
      where: { id },
      data: updateData,
    });

    return this.mapToDomain(prismaPayment);
  }

  async softDelete(id: string, userId: string): Promise<void> {
    await this.prisma.payment.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: userId },
    });
  }

  private mapToDomain(prismaPayment: PrismaPayment): Payment {
    return new Payment(
      Number(prismaPayment.amount),
      prismaPayment.paidAt,
      prismaPayment.paymentMethod as Payment['paymentMethod'],
      prismaPayment.rentalId,
      prismaPayment.invoiceId,
      prismaPayment.reference,
      prismaPayment.receiptUrl,
      prismaPayment.createdAt,
      prismaPayment.updatedAt,
      prismaPayment.id,
      prismaPayment.deletedAt ?? undefined,
      prismaPayment.createdById ?? undefined,
      prismaPayment.updatedById ?? undefined,
      prismaPayment.deletedById ?? undefined
    );
  }
}
