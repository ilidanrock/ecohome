/**
 * Constants for Payment domain validation
 */
export const PaymentConstants = {
  MAX_AMOUNT: 999999.99,
  MIN_AMOUNT: 0.01,
  MAX_REFERENCE_LENGTH: 255,
  DEFAULT_PAYMENT_LIMIT: 100,
} as const;
