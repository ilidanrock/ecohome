import type { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import type { Property } from '@/src/domain/Property/Property';

export class GetPropertyById {
  constructor(private propertyRepository: IPropertyRepository) {}

  async execute(id: string): Promise<Property | null> {
    return this.propertyRepository.findById(id);
  }
}
