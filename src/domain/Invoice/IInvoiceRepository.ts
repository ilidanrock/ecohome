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
   * Update invoice status and paidAt date
   * @param id - The invoice ID
   * @param status - The new payment status
   * @param paidAt - The date when the invoice was paid
   * @returns The updated invoice entity
   */
  updateStatus(id: string, status: PaymentStatus, paidAt: Date): Promise<Invoice>;

  /**
   * Update invoice status and paidAt date within a transaction
   * @param id - The invoice ID
   * @param status - The new payment status
   * @param paidAt - The date when the invoice was paid
   * @param tx - The transaction client
   * @returns The updated invoice entity
   */
  updateStatusInTransaction(
    id: string,
    status: PaymentStatus,
    paidAt: Date,
    tx: TransactionClient
  ): Promise<Invoice>;
}
