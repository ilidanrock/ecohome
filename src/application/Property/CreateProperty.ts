import type { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import type { IAuditLogRepository } from '@/src/domain/Shared/IAuditLogRepository';
import { Property } from '@/src/domain/Property/Property';

export class CreateProperty {
  constructor(
    private propertyRepository: IPropertyRepository,
    private auditLog: IAuditLogRepository
  ) {}

  async execute(name: string, address: string, administratorUserId: string): Promise<Property> {
    const now = new Date();
    const property = new Property(name, address, now, now);
    const created = await this.propertyRepository.create(property, administratorUserId);
    await this.auditLog.record({
      entityType: 'Property',
      entityId: created.id,
      action: 'created',
      performedById: administratorUserId,
    });
    return created;
  }
}
