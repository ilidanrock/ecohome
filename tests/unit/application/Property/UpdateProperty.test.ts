import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateProperty } from '@/src/application/Property/UpdateProperty';
import type { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import type { IAuditLogRepository } from '@/src/domain/Shared/IAuditLogRepository';
import { Property } from '@/src/domain/Property/Property';

describe('UpdateProperty', () => {
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

  it('updates property and records audit when found', async () => {
    const updated = new Property(
      'Nombre Nuevo',
      'Dirección Nueva',
      new Date(),
      new Date(),
      'prop-1'
    );
    vi.mocked(propertyRepository.update).mockResolvedValue(updated);

    const useCase = new UpdateProperty(propertyRepository, auditLog);
    const result = await useCase.execute('prop-1', 'Nombre Nuevo', 'Dirección Nueva', 'user-1');

    expect(propertyRepository.update).toHaveBeenCalledWith(
      'prop-1',
      'Nombre Nuevo',
      'Dirección Nueva',
      'user-1'
    );
    expect(result).toBe(updated);
    expect(auditLog.record).toHaveBeenCalledWith({
      entityType: 'Property',
      entityId: 'prop-1',
      action: 'updated',
      performedById: 'user-1',
    });
  });

  it('returns null and does not record audit when property not found', async () => {
    vi.mocked(propertyRepository.update).mockResolvedValue(null);

    const useCase = new UpdateProperty(propertyRepository, auditLog);
    const result = await useCase.execute('prop-404', 'A', 'B', 'user-1');

    expect(result).toBeNull();
    expect(auditLog.record).not.toHaveBeenCalled();
  });
});
