import { IInvoiceRepository } from '@/src/domain/Invoice/IInvoiceRepository';
import { Invoice } from '@/src/domain/Invoice/Invoice';
import { InvoiceAccessDeniedError } from '@/src/domain/Invoice/errors/InvoiceErrors';

export class GetInvoiceById {
  constructor(private invoiceRepository: IInvoiceRepository) {}

  /**
   * Get an invoice by ID with permission validation
   *
   * @param invoiceId - The invoice ID
   * @param userId - The user ID requesting access (optional, for permission check)
   * @param userRole - The role of the user requesting access
   * @returns The invoice entity or null if not found
   * @throws Error if user doesn't have permission to access the invoice
   */
  async execute(invoiceId: string, userId?: string, userRole?: string): Promise<Invoice | null> {
    // Include rental relation for permission validation
    const invoice = await this.invoiceRepository.findById(invoiceId, true);

    if (!invoice) {
      return null;
    }

    // Admin can access any invoice, User can only access their own
    const rental = invoice.getRental();
    if (userRole !== 'ADMIN' && userId && rental && rental.getUserId() !== userId) {
      throw new InvoiceAccessDeniedError('You do not have permission to access this invoice');
    }

    return invoice;
  }
}
