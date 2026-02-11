import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetUserInvoices } from '@/src/application/Invoice/GetUserInvoices';
import type { IInvoiceRepository } from '@/src/domain/Invoice/IInvoiceRepository';
import type { IRentalRepository } from '@/src/domain/Rental/IRentalRepository';
import { Rental } from '@/src/domain/Rental/Rental';
import { Invoice } from '@/src/domain/Invoice/Invoice';

describe('GetUserInvoices', () => {
  let rentalRepository: IRentalRepository;
  let invoiceRepository: IInvoiceRepository;

  beforeEach(() => {
    rentalRepository = {
      findByUserId: vi.fn(),
      findById: vi.fn(),
      findActiveByPropertyId: vi.fn(),
    };
    invoiceRepository = {
      findManyByRentalIds: vi.fn(),
      findById: vi.fn(),
      findByRentalMonthYear: vi.fn(),
      findByRentalMonthYearInTransaction: vi.fn(),
      create: vi.fn(),
      createInTransaction: vi.fn(),
      updateStatus: vi.fn(),
      updateStatusInTransaction: vi.fn(),
    };
  });

  it('returns empty array when user has no rentals', async () => {
    vi.mocked(rentalRepository.findByUserId).mockResolvedValue([]);

    const useCase = new GetUserInvoices(rentalRepository, invoiceRepository);
    const result = await useCase.execute('user-1');

    expect(result).toEqual([]);
    expect(invoiceRepository.findManyByRentalIds).not.toHaveBeenCalled();
  });

  it('returns invoices for user rentals', async () => {
    const rental = new Rental(
      'user-1',
      'prop-1',
      new Date('2024-01-01'),
      null,
      new Date(),
      new Date(),
      'rental-1'
    );
    vi.mocked(rentalRepository.findByUserId).mockResolvedValue([rental]);

    const invoice = new Invoice(
      'rental-1',
      1,
      2025,
      10,
      50,
      60,
      'UNPAID',
      null,
      null,
      null,
      new Date(),
      new Date(),
      'inv-1'
    );
    vi.mocked(invoiceRepository.findManyByRentalIds).mockResolvedValue([invoice]);

    const useCase = new GetUserInvoices(rentalRepository, invoiceRepository);
    const result = await useCase.execute('user-1');

    expect(rentalRepository.findByUserId).toHaveBeenCalledWith('user-1');
    expect(invoiceRepository.findManyByRentalIds).toHaveBeenCalledWith(['rental-1'], undefined);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'inv-1',
      rentalId: 'rental-1',
      month: 1,
      year: 2025,
      totalCost: 60,
      status: 'UNPAID',
    });
  });

  it('filters by status when options provided', async () => {
    const rental = new Rental(
      'user-1',
      'prop-1',
      new Date('2024-01-01'),
      null,
      new Date(),
      new Date(),
      'rental-1'
    );
    vi.mocked(rentalRepository.findByUserId).mockResolvedValue([rental]);
    vi.mocked(invoiceRepository.findManyByRentalIds).mockResolvedValue([]);

    const useCase = new GetUserInvoices(rentalRepository, invoiceRepository);
    await useCase.execute('user-1', { status: 'UNPAID' });

    expect(invoiceRepository.findManyByRentalIds).toHaveBeenCalledWith(['rental-1'], {
      status: 'UNPAID',
    });
  });
});
