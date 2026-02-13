import { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';

export class DeleteProperty {
  constructor(private propertyRepository: IPropertyRepository) {}

  /**
   * Soft delete a property (sets deletedAt and deletedById).
   * Caller must ensure the user is an administrator of the property.
   */
  async execute(propertyId: string, userId: string): Promise<void> {
    await this.propertyRepository.softDelete(propertyId, userId);
  }
}
