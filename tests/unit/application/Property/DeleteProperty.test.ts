import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteProperty } from '@/src/application/Property/DeleteProperty';
import type { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import type { IRentalRepository } from '@/src/domain/Rental/IRentalRepository';
import type { IAuditLogRepository } from '@/src/domain/Shared/IAuditLogRepository';

describe('DeleteProperty', () => {
  let propertyRepository: IPropertyRepository;
  let rentalRepository: IRentalRepository;
  let auditLog: IAuditLogRepository;

  beforeEach(() => {
    propertyRepository = {
      findById: vi.fn(),
      findByIdWithAdministrators: vi.fn(),
      findManagedByUserId: vi.fn(),
      findManagedByUserIdPaginated: vi.fn(),
      isUserAdministrator: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn().mockResolvedValue(undefined),
    };
    rentalRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findActiveByPropertyId: vi.fn(),
      create: vi.fn(),
      findByUserIdAndPropertyId: vi.fn(),
      findByUserIdAndPropertyIdIncludingDeleted: vi.fn(),
      restore: vi.fn(),
      findNonDeletedByPropertyId: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      softDeleteByPropertyId: vi.fn().mockResolvedValue(undefined),
    };
    auditLog = {
      record: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('soft deletes rentals of the property first, then property, and records audit', async () => {
    const useCase = new DeleteProperty(propertyRepository, rentalRepository, auditLog);
    await useCase.execute('prop-1', 'admin-1');

    expect(rentalRepository.softDeleteByPropertyId).toHaveBeenCalledWith('prop-1', 'admin-1');
    expect(propertyRepository.softDelete).toHaveBeenCalledWith('prop-1', 'admin-1');
    expect(auditLog.record).toHaveBeenCalledWith({
      entityType: 'Property',
      entityId: 'prop-1',
      action: 'deleted',
      performedById: 'admin-1',
    });
  });

  it('calls rental delete, property delete and audit in order', async () => {
    const useCase = new DeleteProperty(propertyRepository, rentalRepository, auditLog);
    await useCase.execute('prop-2', 'user-2');

    const rentalDeleteOrder = vi.mocked(rentalRepository.softDeleteByPropertyId).mock
      .invocationCallOrder[0];
    const propertyDeleteOrder = vi.mocked(propertyRepository.softDelete).mock
      .invocationCallOrder[0];
    const recordCallOrder = vi.mocked(auditLog.record).mock.invocationCallOrder[0];
    expect(rentalDeleteOrder).toBeLessThan(propertyDeleteOrder);
    expect(propertyDeleteOrder).toBeLessThan(recordCallOrder);
  });
});
