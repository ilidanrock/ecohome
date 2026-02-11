import { z } from 'zod';

export const createWaterBillSchema = z.object({
  propertyId: z.string().uuid('Property ID must be a valid UUID'),
  periodStart: z.coerce.date({
    required_error: 'Period start is required',
    invalid_type_error: 'Period start must be a valid date',
  }),
  periodEnd: z.coerce.date({
    required_error: 'Period end is required',
    invalid_type_error: 'Period end must be a valid date',
  }),
  totalConsumption: z
    .number({
      required_error: 'Total consumption is required',
      invalid_type_error: 'Total consumption must be a number',
    })
    .positive('Total consumption must be greater than zero'),
  totalCost: z
    .number({
      required_error: 'Total cost is required',
      invalid_type_error: 'Total cost must be a number',
    })
    .positive('Total cost must be greater than zero'),
  fileUrl: z.string().url('File URL must be a valid URL').optional().nullable(),
});

export const createWaterServiceChargesSchema = z.object({
  waterBillId: z.string().uuid('Water bill ID must be a valid UUID'),
  fixedCharge: z
    .number({
      required_error: 'Fixed charge is required',
      invalid_type_error: 'Fixed charge must be a number',
    })
    .nonnegative('Fixed charge must be non-negative'),
  sewerageCharge: z
    .number({
      required_error: 'Sewerage charge is required',
      invalid_type_error: 'Sewerage charge must be a number',
    })
    .nonnegative('Sewerage charge must be non-negative'),
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
});

export type CreateWaterBillInput = z.infer<typeof createWaterBillSchema>;
export type CreateWaterServiceChargesInput = z.infer<typeof createWaterServiceChargesSchema>;
