import type { IRentalRepository } from '@/src/domain/Rental/IRentalRepository';
import type { IUserRepository } from '@/src/domain/User/UserRepository';

export type PropertyRentalListItem = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  startDate: string;
  endDate: string | null;
};

export class ListRentalsByPropertyId {
  constructor(
    private rentalRepository: IRentalRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(propertyId: string): Promise<PropertyRentalListItem[]> {
    const rentals = await this.rentalRepository.findNonDeletedByPropertyId(propertyId);
    const result: PropertyRentalListItem[] = [];

    for (const rental of rentals) {
      const user = await this.userRepository.findUserById(rental.getUserId());
      const userName = user
        ? [user.name, user.surname].filter(Boolean).join(' ').trim() || user.email
        : '—';
      const userEmail = user?.email ?? '—';
      result.push({
        id: rental.id,
        userId: rental.getUserId(),
        userName,
        userEmail,
        startDate: rental.getStartDate().toISOString(),
        endDate: rental.getEndDate()?.toISOString() ?? null,
      });
    }

    return result;
  }
}
