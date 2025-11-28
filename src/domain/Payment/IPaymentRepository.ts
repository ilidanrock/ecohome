import type { Payment } from './Payment';

/**
 * Transaction Client type - abstracted to maintain DDD boundaries
 * Implementations should use their specific transaction client type
 */
export type TransactionClient = unknown;

export interface IPaymentRepository {
  /**
   * Create a new payment
   * @param payment - The payment entity to create
   * @returns The created payment entity
   */
  create(payment: Payment): Promise<Payment>;

  /**
   * Create a new payment within a transaction
   * @param payment - The payment entity to create
   * @param tx - The transaction client
   * @returns The created payment entity
   */
  createInTransaction(payment: Payment, tx: TransactionClient): Promise<Payment>;

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
   * Find all payments for a specific invoice within a transaction
   * @param invoiceId - The invoice ID
   * @param tx - The transaction client
   * @returns Array of Payment entities ordered by paidAt descending
   */
  findByInvoiceIdInTransaction(invoiceId: string, tx: TransactionClient): Promise<Payment[]>;

  /**
   * Update an existing payment
   * @param id - The payment ID
   * @param payment - Partial payment data to update
   * @returns The updated payment entity
   */
  update(id: string, payment: Partial<Payment>): Promise<Payment>;
}
