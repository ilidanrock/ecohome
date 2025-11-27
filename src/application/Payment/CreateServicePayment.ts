import { IPaymentRepository } from '@/src/domain/Payment/IPaymentRepository';
import { Payment, type PaymentMethod } from '@/src/domain/Payment/Payment';
import { IInvoiceRepository } from '@/src/domain/Invoice/IInvoiceRepository';
import { prisma } from '@/prisma';

export class CreateServicePayment {
  constructor(
    private paymentRepository: IPaymentRepository,
    private invoiceRepository: IInvoiceRepository
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
    const invoice = await this.invoiceRepository.findById(invoiceId);

    if (!invoice) {
      throw new Error(`Invoice with ID ${invoiceId} not found`);
    }

    // Use transaction to prevent race condition when calculating payments and updating invoice status
    const result = await prisma.$transaction(
      async (tx) => {
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

        // Save payment using repository (but we need to create it directly in the transaction)
        // For now, we'll create it and then recalculate
        const prismaPayment = await tx.payment.create({
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

        // Calculate total payments for this invoice within the transaction
        const allPayments = await tx.payment.findMany({
          where: { invoiceId },
          select: { amount: true },
        });

        const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const invoiceTotal = Number(invoice.getTotalCost());

        // Update Invoice status to PAID if total is covered (within transaction)
        if (totalPaid >= invoiceTotal) {
          await tx.invoice.update({
            where: { id: invoiceId },
            data: {
              status: 'PAID',
              paidAt: paidAt,
            },
          });
        }

        // Map Prisma payment to domain entity
        return new Payment(
          Number(prismaPayment.amount),
          prismaPayment.paidAt,
          prismaPayment.paymentMethod as PaymentMethod,
          prismaPayment.rentalId,
          prismaPayment.invoiceId,
          prismaPayment.reference,
          prismaPayment.receiptUrl,
          prismaPayment.createdAt,
          prismaPayment.updatedAt,
          prismaPayment.id
        );
      },
      {
        isolationLevel: 'Serializable', // Highest isolation level to prevent race conditions
      }
    );

    return result;
  }
}
