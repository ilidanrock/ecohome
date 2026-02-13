import type { WaterBill } from './WaterBill';

export interface IWaterBillRepository {
  /**
   * Find water bill by ID
   * @param id - The water bill ID
   * @returns WaterBill entity or null if not found
   */
  findById(id: string): Promise<WaterBill | null>;

  /**
   * Find water bills by property ID
   * @param propertyId - The property ID
   * @returns Array of WaterBill entities
   */
  findByPropertyId(propertyId: string): Promise<WaterBill[]>;

  /**
   * Find water bills by multiple property IDs (e.g. for admin dashboard)
   * @param propertyIds - Array of property IDs
   * @returns Array of WaterBill entities ordered by periodStart desc
   */
  findManyByPropertyIds(propertyIds: string[]): Promise<WaterBill[]>;

  /**
   * Find water bill by property and period
   * @param propertyId - The property ID
   * @param periodStart - Start of the period
   * @param periodEnd - End of the period
   * @returns WaterBill entity or null if not found
   */
  findByPropertyAndPeriod(
    propertyId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<WaterBill | null>;

  /**
   * Create new water bill
   * @param waterBill - The water bill entity to create
   * @param userId - The user ID performing the create
   * @returns The created WaterBill entity
   */
  create(waterBill: WaterBill, userId: string): Promise<WaterBill>;

  /**
   * Update existing water bill
   * @param waterBill - The water bill entity to update
   * @param userId - The user ID performing the update
   * @returns The updated WaterBill entity
   */
  update(waterBill: WaterBill, userId: string): Promise<WaterBill>;

  /**
   * Soft delete water bill (set deletedAt and deletedById).
   * @param id - The water bill ID
   * @param userId - The user ID performing the delete
   */
  softDelete(id: string, userId: string): Promise<void>;
}
