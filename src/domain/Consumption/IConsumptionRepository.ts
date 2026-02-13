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
   * Find consumption by rental, month and year
   * @param rentalId - The rental ID
   * @param month - The month (1-12)
   * @param year - The year
   * @returns The consumption entity or null if not found
   */
  findByRentalMonthYear(rentalId: string, month: number, year: number): Promise<Consumption | null>;

  /**
   * Find consumption by ID
   * @param id - The consumption ID
   * @returns The consumption entity or null if not found
   */
  findById(id: string): Promise<Consumption | null>;

  /**
   * Find the most recent consumption for a user
   * @param userId - The user ID
   * @returns The most recent Consumption or null
   */
  findLatestByUserId(userId: string): Promise<Consumption | null>;

  /**
   * Update a consumption entity
   * @param consumption - The consumption entity to update
   * @param userId - The user ID performing the update
   * @returns The updated consumption entity
   */
  update(consumption: Consumption, userId: string): Promise<Consumption>;

  /**
   * Soft delete a consumption (set deletedAt and deletedById).
   * @param id - The consumption ID
   * @param userId - The user ID performing the delete
   */
  softDelete(id: string, userId: string): Promise<void>;
}
