import type { Rental } from './Rental';

export interface IRentalRepository {
  /**
   * Find a rental by ID
   * @param id - The rental ID
   * @returns The rental entity or null if not found
   */
  findById(id: string): Promise<Rental | null>;

  /**
   * Find all rentals for a user (active or past)
   * @param userId - The user ID
   * @returns Array of Rental entities
   */
  findByUserId(userId: string): Promise<Rental[]>;

  /**
   * Find all active rentals for a property
   * @param propertyId - The property ID
   * @param date - The date to check if rental is active
   * @returns Array of active Rental entities
   */
  findActiveByPropertyId(propertyId: string, date: Date): Promise<Rental[]>;
}
