import type { IRentalRepository } from '@/src/domain/Rental/IRentalRepository';
import type { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';

export type TenantRentalWithProperty = {
  rentalId: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  startDate: string;
  endDate: string | null;
};

/**
 * Lists all rentals for a tenant (user) with property details.
 * Used so tenants can see their assigned properties.
 */
export class ListRentalsForTenant {
  constructor(
    private rentalRepository: IRentalRepository,
    private propertyRepository: IPropertyRepository
  ) {}

  async execute(userId: string): Promise<TenantRentalWithProperty[]> {
    const rentals = await this.rentalRepository.findByUserId(userId);
    const result: TenantRentalWithProperty[] = [];

    for (const rental of rentals) {
      const property = await this.propertyRepository.findById(rental.getPropertyId());
      // Solo mostrar asignaciones cuya propiedad existe y no está eliminada
      if (!property) continue;

      result.push({
        rentalId: rental.id,
        propertyId: rental.getPropertyId(),
        propertyName: property.getName(),
        propertyAddress: property.getAddress(),
        startDate: rental.getStartDate().toISOString(),
        endDate: rental.getEndDate()?.toISOString() ?? null,
      });
    }

    return result;
  }
}
