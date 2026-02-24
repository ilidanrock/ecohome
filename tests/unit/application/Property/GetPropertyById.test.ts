import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetPropertyById } from '@/src/application/Property/GetPropertyById';
import type { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import { Property } from '@/src/domain/Property/Property';

describe('GetPropertyById', () => {
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

  it('returns property when found', async () => {
    const now = new Date();
    const prop = new Property('Casa', 'Av. 1', now, now, 'prop-1');
    vi.mocked(propertyRepository.findById).mockResolvedValue(prop);

    const useCase = new GetPropertyById(propertyRepository);
    const result = await useCase.execute('prop-1');

    expect(propertyRepository.findById).toHaveBeenCalledWith('prop-1');
    expect(result).toBe(prop);
    expect(result?.id).toBe('prop-1');
    expect(result?.name).toBe('Casa');
  });

  it('returns null when property not found', async () => {
    vi.mocked(propertyRepository.findById).mockResolvedValue(null);

    const useCase = new GetPropertyById(propertyRepository);
    const result = await useCase.execute('prop-404');

    expect(propertyRepository.findById).toHaveBeenCalledWith('prop-404');
    expect(result).toBeNull();
  });
});
