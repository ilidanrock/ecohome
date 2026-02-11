import type { WaterServiceCharges } from './WaterServiceCharges';

export interface IWaterServiceChargesRepository {
  /**
   * Find service charges by water bill ID
   * @param waterBillId - The water bill ID
   * @returns WaterServiceCharges entity or null if not found
   */
  findByWaterBillId(waterBillId: string): Promise<WaterServiceCharges | null>;

  /**
   * Create new water service charges
   * @param waterServiceCharges - The water service charges entity to create
   * @returns The created WaterServiceCharges entity
   */
  create(waterServiceCharges: WaterServiceCharges): Promise<WaterServiceCharges>;

  /**
   * Update existing water service charges
   * @param waterServiceCharges - The water service charges entity to update
   * @returns The updated WaterServiceCharges entity
   */
  update(waterServiceCharges: WaterServiceCharges): Promise<WaterServiceCharges>;

  /**
   * Delete water service charges by water bill ID
   * @param waterBillId - The water bill ID
   */
  deleteByWaterBillId(waterBillId: string): Promise<void>;
}
