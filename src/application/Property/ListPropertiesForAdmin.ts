import type { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import type { Property } from '@/src/domain/Property/Property';

export class ListPropertiesForAdmin {
  constructor(private propertyRepository: IPropertyRepository) {}

  async execute(userId: string): Promise<Property[]> {
    return this.propertyRepository.findManagedByUserId(userId);
  }
}
