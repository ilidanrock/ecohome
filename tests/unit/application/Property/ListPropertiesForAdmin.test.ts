import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListPropertiesForAdmin } from '@/src/application/Property/ListPropertiesForAdmin';
import type { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import { Property } from '@/src/domain/Property/Property';

describe('ListPropertiesForAdmin', () => {
  let propertyRepository: IPropertyRepository;

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
  });

  it('returns empty array when admin has no managed properties', async () => {
    vi.mocked(propertyRepository.findManagedByUserId).mockResolvedValue([]);

    const useCase = new ListPropertiesForAdmin(propertyRepository);
    const result = await useCase.execute('admin-1');

    expect(propertyRepository.findManagedByUserId).toHaveBeenCalledWith('admin-1');
    expect(result).toEqual([]);
  });

  it('returns all properties managed by the user', async () => {
    const now = new Date();
    const props = [
      new Property('Casa 1', 'Av. 1', now, now, 'p1'),
      new Property('Casa 2', 'Av. 2', now, now, 'p2'),
    ];
    vi.mocked(propertyRepository.findManagedByUserId).mockResolvedValue(props);

    const useCase = new ListPropertiesForAdmin(propertyRepository);
    const result = await useCase.execute('admin-1');

    expect(propertyRepository.findManagedByUserId).toHaveBeenCalledWith('admin-1');
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('p1');
    expect(result[0].name).toBe('Casa 1');
    expect(result[1].id).toBe('p2');
    expect(result[1].name).toBe('Casa 2');
  });
});
