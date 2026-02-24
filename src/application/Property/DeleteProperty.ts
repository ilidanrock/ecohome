import type { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import type { IAuditLogRepository } from '@/src/domain/Shared/IAuditLogRepository';

export class DeleteProperty {
  constructor(
    private propertyRepository: IPropertyRepository,
    private auditLog: IAuditLogRepository
  ) {}

  /**
   * Soft delete a property (sets deletedAt and deletedById).
   * Caller must ensure the user is an administrator of the property.
   */
  async execute(propertyId: string, userId: string): Promise<void> {
    await this.propertyRepository.softDelete(propertyId, userId);
    await this.auditLog.record({
      entityType: 'Property',
      entityId: propertyId,
      action: 'deleted',
      performedById: userId,
    });
  }
}
