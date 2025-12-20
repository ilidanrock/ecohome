import { ApiHelper, CreatePaymentData } from '../support/api';

export interface TestPaymentData extends CreatePaymentData {
  id?: string;
}

/**
 * Create a test payment
 */
export async function createTestPayment(
  paymentData: CreatePaymentData,
  cookies: string[],
  apiHelper: ApiHelper
): Promise<{ id: string }> {
  return apiHelper.createPayment(paymentData, cookies);
}

/**
 * Get default test payment data for rental
 */
export function getTestRentalPaymentData(
  rentalId: string,
  amount: number,
  paidAt?: Date,
  paymentMethod: 'YAPE' | 'CASH' | 'BANK_TRANSFER' = 'CASH'
): CreatePaymentData {
  return {
    type: 'rental',
    rentalId,
    amount,
    paidAt: paidAt || new Date(),
    paymentMethod,
  };
}

/**
 * Get default test payment data for invoice
 */
export function getTestInvoicePaymentData(
  invoiceId: string,
  amount: number,
  paidAt?: Date,
  paymentMethod: 'YAPE' | 'CASH' | 'BANK_TRANSFER' = 'CASH'
): CreatePaymentData {
  return {
    type: 'invoice',
    invoiceId,
    amount,
    paidAt: paidAt || new Date(),
    paymentMethod,
  };
}
