import type { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import type { IRentalRepository } from '@/src/domain/Rental/IRentalRepository';
import type { IAuditLogRepository } from '@/src/domain/Shared/IAuditLogRepository';

export class DeleteProperty {
  constructor(
    private propertyRepository: IPropertyRepository,
    private rentalRepository: IRentalRepository,
    private auditLog: IAuditLogRepository
  ) {}

  /**
   * Soft delete a property (sets deletedAt and deletedById).
   * Also soft-deletes all rentals of that property so tenants do not see orphan assignments.
   * Caller must ensure the user is an administrator of the property.
   */
  async execute(propertyId: string, userId: string): Promise<void> {
    await this.rentalRepository.softDeleteByPropertyId(propertyId, userId);
    await this.propertyRepository.softDelete(propertyId, userId);
    await this.auditLog.record({
      entityType: 'Property',
      entityId: propertyId,
      action: 'deleted',
      performedById: userId,
    });
  }
}
