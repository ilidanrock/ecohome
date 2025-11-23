import { IPaymentRepository } from '@/src/domain/Payment/IPaymentRepository';
import type { Payment } from '@/src/domain/Payment/Payment';

export class GetPaymentsByInvoice {
  constructor(private paymentRepository: IPaymentRepository) {}

  /**
   * Get all payments for a specific invoice
   * Returns payments ordered by paidAt descending (most recent first)
   *
   * @param invoiceId - The invoice ID
   * @returns Array of Payment entities ordered by paidAt descending
   */
  async execute(invoiceId: string): Promise<Payment[]> {
    return await this.paymentRepository.findByInvoiceId(invoiceId);
  }
}
