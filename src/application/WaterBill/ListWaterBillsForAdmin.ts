import { IWaterBillRepository } from '@/src/domain/WaterBill/IWaterBillRepository';
import { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import { PropertyAccessDeniedError } from '@/src/domain/Invoice/errors/InvoiceErrors';
import type { WaterBillListItem } from '@/types';

export class ListWaterBillsForAdmin {
  constructor(
    private propertyRepository: IPropertyRepository,
    private waterBillRepository: IWaterBillRepository
  ) {}

  /**
   * List water bills for admin. If propertyId is provided, only that property (and user must be admin).
   * Otherwise all properties managed by the user.
   */
  async execute(userId: string, propertyId?: string): Promise<WaterBillListItem[]> {
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

    const bills = await this.waterBillRepository.findManyByPropertyIds(propertyIds);
    return bills.map((b) => ({
      id: b.id,
      propertyId: b.propertyId,
      periodStart: b.periodStart.toISOString(),
      periodEnd: b.periodEnd.toISOString(),
      totalConsumption: b.totalConsumption,
      totalCost: b.totalCost,
    }));
  }
}
