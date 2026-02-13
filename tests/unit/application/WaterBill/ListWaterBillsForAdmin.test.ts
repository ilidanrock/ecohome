import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListWaterBillsForAdmin } from '@/src/application/WaterBill/ListWaterBillsForAdmin';
import type { IWaterBillRepository } from '@/src/domain/WaterBill/IWaterBillRepository';
import type { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import { PropertyAccessDeniedError } from '@/src/domain/Invoice/errors/InvoiceErrors';
import { WaterBill } from '@/src/domain/WaterBill/WaterBill';
import { Property } from '@/src/domain/Property/Property';

describe('ListWaterBillsForAdmin', () => {
  let propertyRepository: IPropertyRepository;
  let waterBillRepository: IWaterBillRepository;

  beforeEach(() => {
    propertyRepository = {
      findById: vi.fn(),
      findByIdWithAdministrators: vi.fn(),
      findManagedByUserId: vi.fn(),
      isUserAdministrator: vi.fn(),
    };
    waterBillRepository = {
      findById: vi.fn(),
      findByPropertyId: vi.fn(),
      findManyByPropertyIds: vi.fn(),
      findByPropertyAndPeriod: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
  });

  it('returns empty array when admin has no managed properties', async () => {
    vi.mocked(propertyRepository.findManagedByUserId).mockResolvedValue([]);

    const useCase = new ListWaterBillsForAdmin(propertyRepository, waterBillRepository);
    const result = await useCase.execute('admin-1');

    expect(result).toEqual([]);
    expect(waterBillRepository.findManyByPropertyIds).not.toHaveBeenCalled();
  });

  it('returns bills for all managed properties when no propertyId filter', async () => {
    const prop = new Property('Casa 1', 'Av. 1', new Date(), new Date(), 'prop-1');
    vi.mocked(propertyRepository.findManagedByUserId).mockResolvedValue([prop]);

    const bill = new WaterBill(
      'prop-1',
      new Date('2025-01-01'),
      new Date('2025-01-31'),
      10,
      80,
      null,
      new Date(),
      new Date(),
      'bill-1'
    );
    vi.mocked(waterBillRepository.findManyByPropertyIds).mockResolvedValue([bill]);

    const useCase = new ListWaterBillsForAdmin(propertyRepository, waterBillRepository);
    const result = await useCase.execute('admin-1');

    expect(propertyRepository.findManagedByUserId).toHaveBeenCalledWith('admin-1');
    expect(waterBillRepository.findManyByPropertyIds).toHaveBeenCalledWith(['prop-1']);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'bill-1',
      propertyId: 'prop-1',
      totalConsumption: 10,
      totalCost: 80,
    });
    expect(result[0].periodStart).toBeDefined();
    expect(result[0].periodEnd).toBeDefined();
  });

  it('throws PropertyAccessDeniedError when propertyId provided and user is not admin', async () => {
    vi.mocked(propertyRepository.isUserAdministrator).mockResolvedValue(false);

    const useCase = new ListWaterBillsForAdmin(propertyRepository, waterBillRepository);

    await expect(useCase.execute('user-1', 'prop-1')).rejects.toThrow(PropertyAccessDeniedError);
    expect(waterBillRepository.findManyByPropertyIds).not.toHaveBeenCalled();
  });

  it('returns bills for single property when propertyId provided and user is admin', async () => {
    vi.mocked(propertyRepository.isUserAdministrator).mockResolvedValue(true);
    const bill = new WaterBill(
      'prop-1',
      new Date('2025-01-01'),
      new Date('2025-01-31'),
      15,
      90,
      null,
      new Date(),
      new Date(),
      'bill-2'
    );
    vi.mocked(waterBillRepository.findManyByPropertyIds).mockResolvedValue([bill]);

    const useCase = new ListWaterBillsForAdmin(propertyRepository, waterBillRepository);
    const result = await useCase.execute('admin-1', 'prop-1');

    expect(propertyRepository.isUserAdministrator).toHaveBeenCalledWith('prop-1', 'admin-1');
    expect(waterBillRepository.findManyByPropertyIds).toHaveBeenCalledWith(['prop-1']);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('bill-2');
  });
});
