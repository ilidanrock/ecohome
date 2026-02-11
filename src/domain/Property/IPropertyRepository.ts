import type { Property } from './Property';
import type { User } from '../User/User';

export interface IPropertyRepository {
  /**
   * Find a property by ID
   * @param id - The property ID
   * @returns The property entity or null if not found
   */
  findById(id: string): Promise<Property | null>;

  /**
   * Find a property by ID with administrators
   * @param id - The property ID
   * @returns The property entity with administrators or null if not found
   */
  findByIdWithAdministrators(id: string): Promise<{
    property: Property;
    administrators: User[];
  } | null>;

  /**
   * Find all properties managed by a user (admin)
   * @param userId - The user ID
   * @returns Array of Property entities
   */
  findManagedByUserId(userId: string): Promise<Property[]>;

  /**
   * Check if a user is an administrator of a property
   * @param propertyId - The property ID
   * @param userId - The user ID
   * @returns True if the user is an administrator, false otherwise
   */
  isUserAdministrator(propertyId: string, userId: string): Promise<boolean>;
}
