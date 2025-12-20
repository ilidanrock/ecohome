import { ApiHelper, CreateUserData } from '../support/api';
import { DatabaseHelper } from '../support/database';

export const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'Test1234!',
    role: 'ADMIN' as const,
    name: 'Admin',
    surname: 'Test',
  },
  user: {
    email: 'user@test.com',
    password: 'Test1234!',
    role: 'USER' as const,
    name: 'User',
    surname: 'Test',
  },
  user2: {
    email: 'user2@test.com',
    password: 'Test1234!',
    role: 'USER' as const,
    name: 'User2',
    surname: 'Test',
  },
};

/**
 * Create a test user via API
 */
export async function createTestUser(
  userData: CreateUserData,
  apiHelper: ApiHelper
): Promise<{ id: string; email: string }> {
  return apiHelper.createUser(userData);
}

/**
 * Cleanup test user and all related data
 */
export async function cleanupTestUser(
  email: string,
  databaseHelper: DatabaseHelper
): Promise<void> {
  await databaseHelper.cleanupTestData(email);
}

/**
 * Get test user credentials
 */
export function getTestUser(type: 'admin' | 'user' | 'user2') {
  return testUsers[type];
}
