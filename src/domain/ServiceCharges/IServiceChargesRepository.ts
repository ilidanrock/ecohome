import type { ServiceCharges } from './ServiceCharges';

export interface IServiceChargesRepository {
  /**
   * Find service charges by electricity bill ID
   * @param electricityBillId - The electricity bill ID
   * @returns ServiceCharges entity or null if not found
   */
  findByElectricityBillId(electricityBillId: string): Promise<ServiceCharges | null>;

  /**
   * Create new service charges
   * @param serviceCharges - The service charges entity to create
   * @returns The created ServiceCharges entity
   */
  create(serviceCharges: ServiceCharges): Promise<ServiceCharges>;

  /**
   * Update existing service charges
   * @param serviceCharges - The service charges entity to update
   * @returns The updated ServiceCharges entity
   */
  update(serviceCharges: ServiceCharges): Promise<ServiceCharges>;

  /**
   * Delete service charges by electricity bill ID
   * @param electricityBillId - The electricity bill ID
   */
  deleteByElectricityBillId(electricityBillId: string): Promise<void>;
}
