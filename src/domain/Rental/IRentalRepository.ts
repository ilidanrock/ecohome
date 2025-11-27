import type { Rental } from './Rental';

export interface IRentalRepository {
  /**
   * Find a rental by ID
   * @param id - The rental ID
   * @returns The rental entity or null if not found
   */
  findById(id: string): Promise<Rental | null>;
}
