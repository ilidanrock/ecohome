import type { Invoice } from './Invoice';

import type { PaymentStatus } from '@/types';

/**
 * Transaction Client type - abstracted to maintain DDD boundaries
 */
export type TransactionClient = unknown;

export interface IInvoiceRepository {
  /**
   * Find an invoice by ID
   * @param id - The invoice ID
   * @param includeRental - Whether to include the rental relation
   * @returns The invoice entity or null if not found
   */
  findById(id: string, includeRental?: boolean): Promise<Invoice | null>;

  /**
   * Find invoices by rental IDs, optionally filtered by status
   * @param rentalIds - Array of rental IDs
   * @param options - Optional filter by status
   * @returns Array of Invoice entities
   */
  findManyByRentalIds(
    rentalIds: string[],
    options?: { status?: PaymentStatus }
  ): Promise<Invoice[]>;

  /**
   * Find invoice by rental, month and year
   * @param rentalId - The rental ID
   * @param month - The month (1-12)
   * @param year - The year
   * @returns The invoice entity or null if not found
   */
  findByRentalMonthYear(rentalId: string, month: number, year: number): Promise<Invoice | null>;

  /**
   * Find invoice by rental, month and year within a transaction
   * @param rentalId - The rental ID
   * @param month - The month (1-12)
   * @param year - The year
   * @param tx - The transaction client
   * @returns The invoice entity or null if not found
   */
  findByRentalMonthYearInTransaction(
    rentalId: string,
    month: number,
    year: number,
    tx: TransactionClient
  ): Promise<Invoice | null>;

  /**
   * Create a new invoice
   * @param invoice - The invoice entity to create
   * @param userId - The user ID performing the create
   * @returns The created invoice entity
   */
  create(invoice: Invoice, userId: string): Promise<Invoice>;

  /**
   * Create a new invoice within a transaction
   * @param invoice - The invoice entity to create
   * @param tx - The transaction client
   * @param userId - The user ID performing the create
   * @returns The created invoice entity
   */
  createInTransaction(invoice: Invoice, tx: TransactionClient, userId: string): Promise<Invoice>;

  /**
   * Update invoice status and paidAt date
   * @param id - The invoice ID
   * @param status - The new payment status
   * @param paidAt - The date when the invoice was paid
   * @param userId - The user ID performing the update
   * @returns The updated invoice entity
   */
  updateStatus(id: string, status: PaymentStatus, paidAt: Date, userId: string): Promise<Invoice>;

  /**
   * Update invoice status and paidAt date within a transaction
   * @param id - The invoice ID
   * @param status - The new payment status
   * @param paidAt - The date when the invoice was paid
   * @param tx - The transaction client
   * @param userId - The user ID performing the update
   * @returns The updated invoice entity
   */
  updateStatusInTransaction(
    id: string,
    status: PaymentStatus,
    paidAt: Date,
    tx: TransactionClient,
    userId: string
  ): Promise<Invoice>;

  /**
   * Soft delete an invoice (set deletedAt and deletedById).
   * @param id - The invoice ID
   * @param userId - The user ID performing the delete
   */
  softDelete(id: string, userId: string): Promise<void>;
}
