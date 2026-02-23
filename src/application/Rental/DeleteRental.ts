import type { IRentalRepository } from '@/src/domain/Rental/IRentalRepository';
import type { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';

export type DeleteRentalInput = {
  rentalId: string;
  deletedById: string;
};

export class DeleteRental {
  constructor(
    private propertyRepository: IPropertyRepository,
    private rentalRepository: IRentalRepository
  ) {}

  async execute(input: DeleteRentalInput): Promise<void> {
    const rental = await this.rentalRepository.findById(input.rentalId);
    if (!rental) {
      throw new Error('Rental not found');
    }

    const isAdmin = await this.propertyRepository.isUserAdministrator(
      rental.propertyId,
      input.deletedById
    );
    if (!isAdmin) {
      throw new Error('You are not an administrator of this property');
    }

    await this.rentalRepository.softDelete(input.rentalId, input.deletedById);
  }
}
