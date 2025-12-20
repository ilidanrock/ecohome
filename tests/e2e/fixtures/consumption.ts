import { ApiHelper, CreateConsumptionData } from '../support/api';

export interface TestConsumptionData extends CreateConsumptionData {
  id?: string;
}

/**
 * Create a test consumption record
 */
export async function createTestConsumption(
  consumptionData: CreateConsumptionData,
  cookies: string[],
  apiHelper: ApiHelper
): Promise<{ id: string }> {
  return apiHelper.createConsumption(consumptionData, cookies);
}

/**
 * Get default test consumption data
 */
export function getTestConsumptionData(
  rentalId: string,
  month?: number,
  year?: number,
  energyReading?: number,
  previousReading?: number
): CreateConsumptionData {
  const now = new Date();
  return {
    rentalId,
    month: month || now.getMonth() + 1,
    year: year || now.getFullYear(),
    energyReading: energyReading || 100.0,
    previousReading: previousReading || null,
  };
}
