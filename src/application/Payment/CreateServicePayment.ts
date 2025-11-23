import { IPaymentRepository } from '@/src/domain/Payment/IPaymentRepository';
import { Payment, type PaymentMethod } from '@/src/domain/Payment/Payment';
import { PrismaClient } from '@prisma/client';
import { prisma } from '@/prisma';

export class CreateServicePayment {
  constructor(
    private paymentRepository: IPaymentRepository,
    private prismaClient: PrismaClient = prisma
  ) {}

  async execute(
    invoiceId: string,
    amount: number,
    paidAt: Date,
    paymentMethod: PaymentMethod,
    reference?: string | null,
    receiptUrl?: string | null
  ): Promise<Payment> {
    // Validate that the Invoice exists
    const invoice = await this.prismaClient.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new Error(`Invoice with ID ${invoiceId} not found`);
    }

    // Create Payment entity
    const now = new Date();
    const payment = new Payment(
      amount,
      paidAt,
      paymentMethod,
      null, // rentalId is null for service payments
      invoiceId,
      reference || null,
      receiptUrl || null,
      now,
      now
    );

    // Save payment using repository
    const createdPayment = await this.paymentRepository.create(payment);

    // Calculate total payments for this invoice
    const allPayments = await this.paymentRepository.findByInvoiceId(invoiceId);
    const totalPaid = allPayments.reduce((sum, p) => sum + p.getAmount(), 0);
    const invoiceTotal = Number(invoice.totalCost);

    // Update Invoice status to PAID if total is covered
    if (totalPaid >= invoiceTotal) {
      await this.prismaClient.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'PAID',
          paidAt: paidAt,
        },
      });
    }

    return createdPayment;
  }
}
