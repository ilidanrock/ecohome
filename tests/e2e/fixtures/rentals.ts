import { ApiHelper, CreateRentalData } from '../support/api';

export interface TestRentalData extends CreateRentalData {
  id?: string;
}

/**
 * Create a test rental
 */
export async function createTestRental(
  rentalData: CreateRentalData,
  cookies: string[],
  apiHelper: ApiHelper
): Promise<{ id: string }> {
  return apiHelper.createRental(rentalData, cookies);
}

/**
 * Get default test rental data
 */
export function getTestRentalData(
  userId: string,
  propertyId: string,
  startDate?: Date,
  endDate?: Date
): CreateRentalData {
  const now = new Date();
  return {
    userId,
    propertyId,
    startDate: startDate || new Date(now.getFullYear(), now.getMonth() - 6, 1), // 6 months ago
    endDate: endDate || null,
  };
}
