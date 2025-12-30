import { IRentalRepository } from '@/src/domain/Rental/IRentalRepository';
import { Rental } from '@/src/domain/Rental/Rental';
import { RentalAccessDeniedError } from '@/src/domain/Rental/errors/RentalErrors';

export class GetRentalById {
  constructor(private rentalRepository: IRentalRepository) {}

  /**
   * Get a rental by ID with permission validation
   *
   * @param rentalId - The rental ID
   * @param userId - The user ID requesting access (optional, for permission check)
   * @param userRole - The role of the user requesting access
   * @returns The rental entity or null if not found
   * @throws Error if user doesn't have permission to access the rental
   */
  async execute(rentalId: string, userId?: string, userRole?: string): Promise<Rental | null> {
    const rental = await this.rentalRepository.findById(rentalId);

    if (!rental) {
      return null;
    }

    // Admin can access any rental, User can only access their own
    if (userRole !== 'ADMIN' && userId && rental.getUserId() !== userId) {
      throw new RentalAccessDeniedError('You do not have permission to access this rental');
    }

    return rental;
  }
}
