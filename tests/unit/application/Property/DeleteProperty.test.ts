import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteProperty } from '@/src/application/Property/DeleteProperty';
import type { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import type { IAuditLogRepository } from '@/src/domain/Shared/IAuditLogRepository';

describe('DeleteProperty', () => {
  let propertyRepository: IPropertyRepository;
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
    auditLog = {
      record: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('soft deletes property and records audit', async () => {
    const useCase = new DeleteProperty(propertyRepository, auditLog);
    await useCase.execute('prop-1', 'admin-1');

    expect(propertyRepository.softDelete).toHaveBeenCalledWith('prop-1', 'admin-1');
    expect(auditLog.record).toHaveBeenCalledWith({
      entityType: 'Property',
      entityId: 'prop-1',
      action: 'deleted',
      performedById: 'admin-1',
    });
  });

  it('calls repository and audit in order', async () => {
    const useCase = new DeleteProperty(propertyRepository, auditLog);
    await useCase.execute('prop-2', 'user-2');

    const softDeleteCallOrder = vi.mocked(propertyRepository.softDelete).mock
      .invocationCallOrder[0];
    const recordCallOrder = vi.mocked(auditLog.record).mock.invocationCallOrder[0];
    expect(softDeleteCallOrder).toBeLessThan(recordCallOrder);
  });
});
