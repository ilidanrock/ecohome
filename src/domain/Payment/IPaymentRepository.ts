import type { Payment } from './Payment';

export interface IPaymentRepository {
  /**
   * Create a new payment
   * @param payment - The payment entity to create
   * @returns The created payment entity
   */
  create(payment: Payment): Promise<Payment>;

  /**
   * Find a payment by ID
   * @param id - The payment ID
   * @returns The payment entity or null if not found
   */
  findById(id: string): Promise<Payment | null>;

  /**
   * Find all payments for a specific rental
   * @param rentalId - The rental ID
   * @returns Array of Payment entities ordered by paidAt descending
   */
  findByRentalId(rentalId: string): Promise<Payment[]>;

  /**
   * Find all payments for a specific invoice
   * @param invoiceId - The invoice ID
   * @returns Array of Payment entities ordered by paidAt descending
   */
  findByInvoiceId(invoiceId: string): Promise<Payment[]>;

  /**
   * Update an existing payment
   * @param id - The payment ID
   * @param payment - Partial payment data to update
   * @returns The updated payment entity
   */
  update(id: string, payment: Partial<Payment>): Promise<Payment>;
}
