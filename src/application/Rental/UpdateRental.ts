import type { IRentalRepository } from '@/src/domain/Rental/IRentalRepository';
import type { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import type { IAuditLogRepository } from '@/src/domain/Shared/IAuditLogRepository';

export type UpdateRentalInput = {
  rentalId: string;
  startDate?: Date;
  endDate?: Date | null;
  updatedById: string;
};

export class UpdateRental {
  constructor(
    private propertyRepository: IPropertyRepository,
    private rentalRepository: IRentalRepository,
    private auditLog: IAuditLogRepository
  ) {}

  async execute(input: UpdateRentalInput) {
    const rental = await this.rentalRepository.findById(input.rentalId);
    if (!rental) {
      throw new Error('Rental not found');
    }

    const isAdmin = await this.propertyRepository.isUserAdministrator(
      rental.propertyId,
      input.updatedById
    );
    if (!isAdmin) {
      throw new Error('You are not an administrator of this property');
    }

    const updated = await this.rentalRepository.update(input.rentalId, {
      startDate: input.startDate,
      endDate: input.endDate,
      updatedById: input.updatedById,
    });
    await this.auditLog.record({
      entityType: 'Rental',
      entityId: input.rentalId,
      action: 'updated',
      performedById: input.updatedById,
    });
    return updated;
  }
}
