import { PrismaClient, Payment as PrismaPayment } from '@prisma/client';
import { IPaymentRepository } from '@/src/domain/Payment/IPaymentRepository';
import { Payment } from '@/src/domain/Payment/Payment';

export class PrismaPaymentRepository implements IPaymentRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new payment
   *
   * @param payment - The payment entity to create
   * @returns The created payment entity
   */
  async create(payment: Payment): Promise<Payment> {
    const prismaPayment = await this.prisma.payment.create({
      data: {
        amount: payment.getAmount(),
        paidAt: payment.getPaidAt(),
        paymentMethod: payment.getPaymentMethod(),
        rentalId: payment.getRentalId() || undefined,
        invoiceId: payment.getInvoiceId() || undefined,
        reference: payment.getReference() || undefined,
        receiptUrl: payment.getReceiptUrl() || undefined,
      },
    });

    return this.mapToDomain(prismaPayment);
  }

  /**
   * Find a payment by ID
   *
   * @param id - The payment ID
   * @returns The payment entity or null if not found
   */
  async findById(id: string): Promise<Payment | null> {
    const prismaPayment = await this.prisma.payment.findUnique({
      where: { id },
    });

    return prismaPayment ? this.mapToDomain(prismaPayment) : null;
  }

  /**
   * Find all payments for a specific rental
   *
   * Performance optimization: Limited to 100 most recent records to prevent
   * loading excessive data. If pagination is needed in the future,
   * consider adding skip/take parameters.
   *
   * @param rentalId - The rental ID
   * @returns Array of Payment entities (max 100, most recent first)
   */
  async findByRentalId(rentalId: string): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: {
        rentalId,
      },
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
      where: {
        invoiceId,
      },
      orderBy: {
        paidAt: 'desc',
      },
      take: 100, // Limit to prevent loading excessive data
    });

    return payments.map((payment) => this.mapToDomain(payment));
  }

  /**
   * Update an existing payment
   *
   * @param id - The payment ID
   * @param payment - Partial payment data to update
   * @returns The updated payment entity
   */
  async update(id: string, payment: Partial<Payment>): Promise<Payment> {
    const updateData: {
      amount?: number;
      paidAt?: Date;
      paymentMethod?: Payment['paymentMethod'];
      reference?: string | null;
      receiptUrl?: string | null;
    } = {};

    if (payment.amount !== undefined) updateData.amount = payment.amount;
    if (payment.paidAt !== undefined) updateData.paidAt = payment.paidAt;
    if (payment.paymentMethod !== undefined) updateData.paymentMethod = payment.paymentMethod;
    if (payment.reference !== undefined) updateData.reference = payment.reference;
    if (payment.receiptUrl !== undefined) updateData.receiptUrl = payment.receiptUrl;

    const prismaPayment = await this.prisma.payment.update({
      where: { id },
      data: updateData,
    });

    return this.mapToDomain(prismaPayment);
  }

  /**
   * Map Prisma Payment model to domain Payment entity
   *
   * @param prismaPayment - The Prisma Payment model
   * @returns The domain Payment entity
   */
  private mapToDomain(prismaPayment: PrismaPayment): Payment {
    return new Payment(
      Number(prismaPayment.amount), // Convert Decimal to number
      prismaPayment.paidAt,
      prismaPayment.paymentMethod as Payment['paymentMethod'],
      prismaPayment.rentalId,
      prismaPayment.invoiceId,
      prismaPayment.reference,
      prismaPayment.receiptUrl,
      prismaPayment.createdAt,
      prismaPayment.updatedAt,
      prismaPayment.id
    );
  }
}
