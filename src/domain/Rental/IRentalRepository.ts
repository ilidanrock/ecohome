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

  /**
   * Create a new rental.
   * @param rental - The rental entity to create (id can be empty; backend may generate it)
   * @returns The created rental with id set
   */
  create(rental: Rental): Promise<Rental>;

  /**
   * Find a non-deleted rental by userId and propertyId (for conflict check).
   */
  findByUserIdAndPropertyId(userId: string, propertyId: string): Promise<Rental | null>;

  /**
   * Find a rental by userId and propertyId including soft-deleted (for restore on re-assign).
   */
  findByUserIdAndPropertyIdIncludingDeleted(
    userId: string,
    propertyId: string
  ): Promise<Rental | null>;

  /**
   * Restore a soft-deleted rental and update dates (for re-assigning a tenant).
   */
  restore(
    id: string,
    data: { startDate: Date; endDate?: Date | null; updatedById: string }
  ): Promise<Rental>;

  /**
   * Find all non-deleted rentals for a property (for admin list).
   */
  findNonDeletedByPropertyId(propertyId: string): Promise<Rental[]>;

  /**
   * Update rental dates. Only startDate and endDate are updatable.
   */
  update(
    id: string,
    data: { startDate?: Date; endDate?: Date | null; updatedById: string }
  ): Promise<Rental>;

  /**
   * Soft delete a rental (set deletedAt and deletedById).
   * @param id - The rental ID
   * @param userId - The user ID performing the delete
   */
  softDelete(id: string, userId: string): Promise<void>;
}
