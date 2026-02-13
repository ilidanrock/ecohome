import type { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import { Property } from '@/src/domain/Property/Property';

export class CreateProperty {
  constructor(private propertyRepository: IPropertyRepository) {}

  async execute(name: string, address: string, administratorUserId: string): Promise<Property> {
    const now = new Date();
    const property = new Property(name, address, now, now);
    return this.propertyRepository.create(property, administratorUserId);
  }
}
