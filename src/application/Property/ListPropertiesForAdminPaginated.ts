import type { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import type { Property } from '@/src/domain/Property/Property';

export class ListPropertiesForAdminPaginated {
  constructor(private propertyRepository: IPropertyRepository) {}

  async execute(
    userId: string,
    options: { page: number; limit: number; search?: string }
  ): Promise<{ properties: Property[]; total: number }> {
    return this.propertyRepository.findManagedByUserIdPaginated(userId, options);
  }
}
