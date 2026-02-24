import type { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import type { IAuditLogRepository } from '@/src/domain/Shared/IAuditLogRepository';
import type { Property } from '@/src/domain/Property/Property';

export class UpdateProperty {
  constructor(
    private propertyRepository: IPropertyRepository,
    private auditLog: IAuditLogRepository
  ) {}

  async execute(
    id: string,
    name: string,
    address: string,
    userId: string
  ): Promise<Property | null> {
    const updated = await this.propertyRepository.update(id, name, address, userId);
    if (updated) {
      await this.auditLog.record({
        entityType: 'Property',
        entityId: id,
        action: 'updated',
        performedById: userId,
      });
    }
    return updated;
  }
}
