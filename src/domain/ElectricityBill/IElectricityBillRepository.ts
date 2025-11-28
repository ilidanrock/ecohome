import type { ElectricityBill } from './ElectricityBill';

export interface IElectricityBillRepository {
  /**
   * Find electricity bill by ID
   * @param id - The electricity bill ID
   * @returns ElectricityBill entity or null if not found
   */
  findById(id: string): Promise<ElectricityBill | null>;

  /**
   * Find electricity bills by property ID
   * @param propertyId - The property ID
   * @returns Array of ElectricityBill entities
   */
  findByPropertyId(propertyId: string): Promise<ElectricityBill[]>;

  /**
   * Find electricity bill by property and period
   * @param propertyId - The property ID
   * @param periodStart - Start of the period
   * @param periodEnd - End of the period
   * @returns ElectricityBill entity or null if not found
   */
  findByPropertyAndPeriod(
    propertyId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<ElectricityBill | null>;

  /**
   * Create new electricity bill
   * @param electricityBill - The electricity bill entity to create
   * @returns The created ElectricityBill entity
   */
  create(electricityBill: ElectricityBill): Promise<ElectricityBill>;

  /**
   * Update existing electricity bill
   * @param electricityBill - The electricity bill entity to update
   * @returns The updated ElectricityBill entity
   */
  update(electricityBill: ElectricityBill): Promise<ElectricityBill>;

  /**
   * Delete electricity bill by ID
   * @param id - The electricity bill ID
   */
  delete(id: string): Promise<void>;
}
