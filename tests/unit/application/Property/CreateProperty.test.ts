import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateProperty } from '@/src/application/Property/CreateProperty';
import type { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import type { IAuditLogRepository } from '@/src/domain/Shared/IAuditLogRepository';
import { Property } from '@/src/domain/Property/Property';

describe('CreateProperty', () => {
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
      softDelete: vi.fn(),
    };
    auditLog = {
      record: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('creates property and records audit', async () => {
    const created = new Property('Casa Nueva', 'Av. 1', new Date(), new Date(), 'prop-123');
    vi.mocked(propertyRepository.create).mockResolvedValue(created);

    const useCase = new CreateProperty(propertyRepository, auditLog);
    const result = await useCase.execute('Casa Nueva', 'Av. 1', 'admin-1');

    expect(propertyRepository.create).toHaveBeenCalledTimes(1);
    const [propertyArg, adminId] = vi.mocked(propertyRepository.create).mock.calls[0];
    expect(propertyArg.name).toBe('Casa Nueva');
    expect(propertyArg.address).toBe('Av. 1');
    expect(adminId).toBe('admin-1');
    expect(result).toBe(created);
    expect(result.id).toBe('prop-123');
    expect(auditLog.record).toHaveBeenCalledWith({
      entityType: 'Property',
      entityId: 'prop-123',
      action: 'created',
      performedById: 'admin-1',
    });
  });

  it('returns created property from repository', async () => {
    const created = new Property('A', 'B', new Date(), new Date(), 'id-1');
    vi.mocked(propertyRepository.create).mockResolvedValue(created);

    const useCase = new CreateProperty(propertyRepository, auditLog);
    const result = await useCase.execute('A', 'B', 'user-1');

    expect(result).toEqual(created);
    expect(result.id).toBe('id-1');
  });
});
