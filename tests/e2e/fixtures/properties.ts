import { ApiHelper, CreatePropertyData } from '../support/api';

export interface TestPropertyData extends CreatePropertyData {
  id?: string;
}

/**
 * Create a test property
 */
export async function createTestProperty(
  propertyData: CreatePropertyData,
  adminCookies: string[],
  apiHelper: ApiHelper
): Promise<{ id: string }> {
  return apiHelper.createProperty(propertyData, adminCookies);
}

/**
 * Get default test property data
 */
export function getTestPropertyData(): CreatePropertyData {
  return {
    name: 'Test Property',
    address: '123 Test Street, Test City',
  };
}
