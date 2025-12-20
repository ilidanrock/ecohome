import { ApiHelper, CreateElectricityBillData } from '../support/api';

export interface TestElectricityBillData extends CreateElectricityBillData {
  id?: string;
}

/**
 * Create a test electricity bill
 */
export async function createTestElectricityBill(
  billData: CreateElectricityBillData,
  cookies: string[],
  apiHelper: ApiHelper
): Promise<{ id: string }> {
  return apiHelper.createElectricityBill(billData, cookies);
}

/**
 * Get default test electricity bill data
 */
export function getTestElectricityBillData(
  propertyId: string,
  periodStart?: Date,
  periodEnd?: Date,
  totalKWh?: number,
  totalCost?: number
): CreateElectricityBillData {
  const now = new Date();
  const start = periodStart || new Date(now.getFullYear(), now.getMonth(), 1);
  const end = periodEnd || new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    propertyId,
    periodStart: start,
    periodEnd: end,
    totalKWh: totalKWh || 1000.0,
    totalCost: totalCost || 500.0,
  };
}
