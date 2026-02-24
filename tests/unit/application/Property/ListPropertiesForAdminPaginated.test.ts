import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListPropertiesForAdminPaginated } from '@/src/application/Property/ListPropertiesForAdminPaginated';
import type { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import { Property } from '@/src/domain/Property/Property';

describe('ListPropertiesForAdminPaginated', () => {
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

  it('returns properties and total from repository', async () => {
    const now = new Date();
    const props = [
      new Property('A', 'Addr 1', now, now, 'p1'),
      new Property('B', 'Addr 2', now, now, 'p2'),
    ];
    vi.mocked(propertyRepository.findManagedByUserIdPaginated).mockResolvedValue({
      properties: props,
      total: 10,
    });

    const useCase = new ListPropertiesForAdminPaginated(propertyRepository);
    const result = await useCase.execute('admin-1', { page: 1, limit: 2 });

    expect(propertyRepository.findManagedByUserIdPaginated).toHaveBeenCalledWith('admin-1', {
      page: 1,
      limit: 2,
    });
    expect(result.properties).toHaveLength(2);
    expect(result.total).toBe(10);
    expect(result.properties[0].id).toBe('p1');
  });

  it('passes search option when provided', async () => {
    vi.mocked(propertyRepository.findManagedByUserIdPaginated).mockResolvedValue({
      properties: [],
      total: 0,
    });

    const useCase = new ListPropertiesForAdminPaginated(propertyRepository);
    await useCase.execute('admin-1', { page: 2, limit: 5, search: 'casa' });

    expect(propertyRepository.findManagedByUserIdPaginated).toHaveBeenCalledWith('admin-1', {
      page: 2,
      limit: 5,
      search: 'casa',
    });
  });

  it('returns empty list when no results', async () => {
    vi.mocked(propertyRepository.findManagedByUserIdPaginated).mockResolvedValue({
      properties: [],
      total: 0,
    });

    const useCase = new ListPropertiesForAdminPaginated(propertyRepository);
    const result = await useCase.execute('admin-1', { page: 1, limit: 10 });

    expect(result.properties).toEqual([]);
    expect(result.total).toBe(0);
  });
});
