import { IElectricityBillRepository } from '@/src/domain/ElectricityBill/IElectricityBillRepository';
import { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import { PropertyAccessDeniedError } from '@/src/domain/Invoice/errors/InvoiceErrors';
import type { ElectricityBillListItem } from '@/types';

export class ListElectricityBillsForAdmin {
  constructor(
    private propertyRepository: IPropertyRepository,
    private electricityBillRepository: IElectricityBillRepository
  ) {}

  /**
   * List electricity bills for admin. If propertyId is provided, only that property (and user must be admin).
   * Otherwise all properties managed by the user.
   */
  async execute(userId: string, propertyId?: string): Promise<ElectricityBillListItem[]> {
    let propertyIds: string[];

    if (propertyId) {
      const isAdmin = await this.propertyRepository.isUserAdministrator(propertyId, userId);
      if (!isAdmin) throw new PropertyAccessDeniedError(propertyId);
      propertyIds = [propertyId];
    } else {
      const properties = await this.propertyRepository.findManagedByUserId(userId);
      propertyIds = properties.map((p) => p.id);
    }

    if (propertyIds.length === 0) return [];

    const bills = await this.electricityBillRepository.findManyByPropertyIds(propertyIds);
    return bills.map((b) => ({
      id: b.id,
      propertyId: b.propertyId,
      periodStart: b.periodStart.toISOString(),
      periodEnd: b.periodEnd.toISOString(),
      totalKWh: b.totalKWh,
      totalCost: b.totalCost,
    }));
  }
}
