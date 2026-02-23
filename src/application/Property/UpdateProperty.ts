import type { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import type { Property } from '@/src/domain/Property/Property';

export class UpdateProperty {
  constructor(private propertyRepository: IPropertyRepository) {}

  async execute(
    id: string,
    name: string,
    address: string,
    userId: string
  ): Promise<Property | null> {
    return this.propertyRepository.update(id, name, address, userId);
  }
}
