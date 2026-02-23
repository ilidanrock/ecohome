import type { Role } from '@/types';
import { User } from './User';

export type UserSearchFilters = {
  role?: Role;
  search?: string;
  limit?: number;
};

export interface IUserRepository {
  createUser(user: User): Promise<User>;
  findUserById(id: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  findAllUsers(): Promise<User[]>;
  findManyForAdmin(filters: UserSearchFilters): Promise<User[]>;
  updateUser(user: User): Promise<User>;
  verifyUserEmail(email: string): Promise<User>;
  deleteUser(id: string): Promise<void>;
}
