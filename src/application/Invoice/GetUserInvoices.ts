import { IInvoiceRepository } from '@/src/domain/Invoice/IInvoiceRepository';
import { IRentalRepository } from '@/src/domain/Rental/IRentalRepository';
import type { PaymentStatus } from '@/types';
import type { InvoiceListItem } from '@/types';

export class GetUserInvoices {
  constructor(
    private rentalRepository: IRentalRepository,
    private invoiceRepository: IInvoiceRepository
  ) {}

  /**
   * Get invoices for the given user (via their rentals).
   *
   * @param userId - The user ID
   * @param options - Optional filter by status (e.g. UNPAID for pending)
   * @returns List of invoice list items
   */
  async execute(userId: string, options?: { status?: PaymentStatus }): Promise<InvoiceListItem[]> {
    const rentals = await this.rentalRepository.findByUserId(userId);
    const rentalIds = rentals.map((r) => r.id);
    if (rentalIds.length === 0) return [];

    const invoices = await this.invoiceRepository.findManyByRentalIds(rentalIds, options);
    return invoices.map((inv) => ({
      id: inv.id,
      rentalId: inv.getRentalId(),
      month: inv.getMonth(),
      year: inv.getYear(),
      totalCost: inv.getTotalCost(),
      status: inv.getStatus(),
    }));
  }
}
