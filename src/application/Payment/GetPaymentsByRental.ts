import { IPaymentRepository } from '@/src/domain/Payment/IPaymentRepository';
import type { Payment } from '@/src/domain/Payment/Payment';

export class GetPaymentsByRental {
  constructor(private paymentRepository: IPaymentRepository) {}

  /**
   * Get all payments for a specific rental
   * Returns payments ordered by paidAt descending (most recent first)
   *
   * @param rentalId - The rental ID
   * @returns Array of Payment entities ordered by paidAt descending
   */
  async execute(rentalId: string): Promise<Payment[]> {
    return await this.paymentRepository.findByRentalId(rentalId);
  }
}
