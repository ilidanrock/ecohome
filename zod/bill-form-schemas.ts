import { z } from 'zod';
import { createElectricityBillSchema } from './electricity-bill-schemas';
import { createServiceChargesSchema } from './service-charges-schemas';

/**
 * Combined schema for creating electricity bill with service charges
 * This is used for the unified form
 */
export const createBillWithChargesSchema = createElectricityBillSchema.extend({
  serviceCharges: z.object({
    maintenanceAndReplacement: z
      .number({
        required_error: 'Maintenance and replacement is required',
        invalid_type_error: 'Maintenance and replacement must be a number',
      })
      .nonnegative('Maintenance and replacement must be non-negative'),
    fixedCharge: z
      .number({
        required_error: 'Fixed charge is required',
        invalid_type_error: 'Fixed charge must be a number',
      })
      .nonnegative('Fixed charge must be non-negative'),
    compensatoryInterest: z
      .number({
        required_error: 'Compensatory interest is required',
        invalid_type_error: 'Compensatory interest must be a number',
      })
      .nonnegative('Compensatory interest must be non-negative'),
    publicLighting: z
      .number({
        required_error: 'Public lighting is required',
        invalid_type_error: 'Public lighting must be a number',
      })
      .nonnegative('Public lighting must be non-negative'),
    lawContribution: z
      .number({
        required_error: 'Law contribution is required',
        invalid_type_error: 'Law contribution must be a number',
      })
      .nonnegative('Law contribution must be non-negative'),
    lateFee: z
      .number({
        required_error: 'Late fee is required',
        invalid_type_error: 'Late fee must be a number',
      })
      .nonnegative('Late fee must be non-negative'),
    previousMonthRounding: z.number({
      required_error: 'Previous month rounding is required',
      invalid_type_error: 'Previous month rounding must be a number',
    }), // Can be negative
    currentMonthRounding: z.number({
      required_error: 'Current month rounding is required',
      invalid_type_error: 'Current month rounding must be a number',
    }), // Can be negative
  }),
});

export type CreateBillWithChargesInput = z.infer<typeof createBillWithChargesSchema>;
