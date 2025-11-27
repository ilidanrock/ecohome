import { z } from 'zod';

/**
 * Schema for validating UUID parameters in route paths
 */
export const uuidParamSchema = z.string().uuid('Invalid ID format');

/**
 * Schema for creating a payment
 * Validates payment data for both rental and invoice payments
 */
export const createPaymentSchema = z
  .object({
    type: z.enum(['rental', 'invoice'], {
      errorMap: () => ({ message: "Type must be either 'rental' or 'invoice'" }),
    }),
    rentalId: z.string().uuid('Invalid rental ID format').optional(),
    invoiceId: z.string().uuid('Invalid invoice ID format').optional(),
    amount: z
      .number()
      .positive('Amount must be a positive number')
      .max(999999.99, 'Amount exceeds maximum allowed (999,999.99)'),
    paidAt: z.string().datetime('Invalid date format. Use ISO 8601 format'),
    paymentMethod: z.enum(['YAPE', 'CASH', 'BANK_TRANSFER'], {
      errorMap: () => ({ message: 'Payment method must be YAPE, CASH, or BANK_TRANSFER' }),
    }),
    reference: z.string().max(255, 'Reference must be 255 characters or less').optional(),
    receiptUrl: z.string().url('Receipt URL must be a valid HTTP/HTTPS URL').optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'rental') {
        return !!data.rentalId;
      }
      return !!data.invoiceId;
    },
    {
      message:
        'rentalId is required when type is "rental", invoiceId is required when type is "invoice"',
      path: ['type'],
    }
  )
  .refine(
    (data) => {
      // Cannot have both rentalId and invoiceId
      return !(data.rentalId && data.invoiceId);
    },
    {
      message: 'Payment cannot be associated with both a rental and an invoice',
      path: ['rentalId'],
    }
  );
