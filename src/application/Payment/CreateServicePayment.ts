import { IPaymentRepository } from '@/src/domain/Payment/IPaymentRepository';
import { Payment, type PaymentMethod } from '@/src/domain/Payment/Payment';
import { IInvoiceRepository } from '@/src/domain/Invoice/IInvoiceRepository';
import { ITransactionManager } from '@/src/domain/Shared/ITransactionManager';
import type { PaymentStatus } from '@/types';
import { InvoiceNotFoundForPaymentError } from '@/src/domain/Payment/errors/PaymentErrors';

export class CreateServicePayment {
  constructor(
    private paymentRepository: IPaymentRepository,
    private invoiceRepository: IInvoiceRepository,
    private transactionManager: ITransactionManager
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
      throw new InvoiceNotFoundForPaymentError(invoiceId);
    }

    // Use transaction to prevent race condition when calculating payments and updating invoice status
    const result = await this.transactionManager.execute(
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

        // Create payment within transaction using repository
        const createdPayment = await this.paymentRepository.createInTransaction(payment, tx);

        // Calculate total payments for this invoice within the transaction
        const allPayments = await this.paymentRepository.findByInvoiceIdInTransaction(
          invoiceId,
          tx
        );

        const totalPaid = allPayments.reduce((sum, p) => sum + p.getAmount(), 0);
        const invoiceTotal = invoice.getTotalCost();

        // Update Invoice status to PAID if total is covered (within transaction)
        if (totalPaid >= invoiceTotal) {
          await this.invoiceRepository.updateStatusInTransaction(
            invoiceId,
            'PAID' as PaymentStatus,
            paidAt,
            tx
          );
        }

        return createdPayment;
      },
      {
        isolationLevel: 'Serializable', // Highest isolation level to prevent race conditions
      }
    );

    return result;
  }
}
