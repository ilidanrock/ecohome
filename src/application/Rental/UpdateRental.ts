import type { IRentalRepository } from '@/src/domain/Rental/IRentalRepository';
import type { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';

export type UpdateRentalInput = {
  rentalId: string;
  startDate?: Date;
  endDate?: Date | null;
  updatedById: string;
};

export class UpdateRental {
  constructor(
    private propertyRepository: IPropertyRepository,
    private rentalRepository: IRentalRepository
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

    return this.rentalRepository.update(input.rentalId, {
      startDate: input.startDate,
      endDate: input.endDate,
      updatedById: input.updatedById,
    });
  }
}
