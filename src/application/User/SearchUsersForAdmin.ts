import type { IUserRepository, UserSearchFilters } from '@/src/domain/User/UserRepository';
import type { User } from '@/src/domain/User/User';

export type SearchUsersForAdminResult = {
  id: string;
  name: string;
  surname: string;
  email: string;
};

export class SearchUsersForAdmin {
  constructor(private userRepository: IUserRepository) {}

  async execute(filters: UserSearchFilters): Promise<SearchUsersForAdminResult[]> {
    const users = await this.userRepository.findManyForAdmin(filters);
    return users.map((u: User) => ({
      id: u.id!,
      name: u.name ?? '',
      surname: u.surname ?? '',
      email: u.email,
    }));
  }
}
