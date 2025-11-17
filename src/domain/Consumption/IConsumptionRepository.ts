import type { Consumption } from './Consumption';

export interface IConsumptionRepository {
  /**
   * Find all consumptions for a specific user
   * @param userId - The user ID
   * @returns Array of Consumption entities
   */
  findByUserId(userId: string): Promise<Consumption[]>;

  /**
   * Find consumptions for a specific rental
   * @param rentalId - The rental ID
   * @returns Array of Consumption entities
   */
  findByRentalId(rentalId: string): Promise<Consumption[]>;

  /**
   * Find the most recent consumption for a user
   * @param userId - The user ID
   * @returns The most recent Consumption or null
   */
  findLatestByUserId(userId: string): Promise<Consumption | null>;
}
