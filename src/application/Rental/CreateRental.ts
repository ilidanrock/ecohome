import type { IRentalRepository } from '@/src/domain/Rental/IRentalRepository';
import type { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import { Rental } from '@/src/domain/Rental/Rental';
import { RentalAlreadyExistsError } from '@/src/domain/Rental/errors/RentalErrors';

export type CreateRentalInput = {
  propertyId: string;
  userId: string;
  startDate: Date;
  endDate?: Date | null;
  createdById: string;
};

export class CreateRental {
  constructor(
    private propertyRepository: IPropertyRepository,
    private rentalRepository: IRentalRepository
  ) {}

  async execute(input: CreateRentalInput): Promise<Rental> {
    const property = await this.propertyRepository.findById(input.propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    const isAdmin = await this.propertyRepository.isUserAdministrator(
      input.propertyId,
      input.createdById
    );
    if (!isAdmin) {
      throw new Error('You are not an administrator of this property');
    }

    const existingIncludingDeleted =
      await this.rentalRepository.findByUserIdAndPropertyIdIncludingDeleted(
        input.userId,
        input.propertyId
      );

    if (existingIncludingDeleted) {
      if (existingIncludingDeleted.deletedAt != null) {
        return this.rentalRepository.restore(existingIncludingDeleted.id!, {
          startDate: input.startDate,
          endDate: input.endDate ?? null,
          updatedById: input.createdById,
        });
      }
      throw new RentalAlreadyExistsError('This tenant is already assigned to this property');
    }

    const now = new Date();
    const rental = new Rental(
      input.userId,
      input.propertyId,
      input.startDate,
      input.endDate ?? null,
      now,
      now,
      undefined,
      null,
      input.createdById,
      null,
      null
    );

    return this.rentalRepository.create(rental);
  }
}
