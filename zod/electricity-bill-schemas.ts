import { z } from 'zod';

export const createElectricityBillSchema = z.object({
  propertyId: z.string().uuid('Property ID must be a valid UUID'),
  periodStart: z.coerce.date({
    required_error: 'Period start is required',
    invalid_type_error: 'Period start must be a valid date',
  }),
  periodEnd: z.coerce.date({
    required_error: 'Period end is required',
    invalid_type_error: 'Period end must be a valid date',
  }),
  totalKWh: z
    .number({
      required_error: 'Total kWh is required',
      invalid_type_error: 'Total kWh must be a number',
    })
    .positive('Total kWh must be greater than zero'),
  totalCost: z
    .number({
      required_error: 'Total cost is required',
      invalid_type_error: 'Total cost must be a number',
    })
    .positive('Total cost must be greater than zero'),
  fileUrl: z.string().url('File URL must be a valid URL').optional().nullable(),
});

export const generateInvoicesSchema = z.object({
  propertyId: z.string().uuid('Property ID must be a valid UUID'),
  electricityBillId: z.string().uuid('Electricity bill ID must be a valid UUID'),
  month: z
    .number({
      required_error: 'Month is required',
      invalid_type_error: 'Month must be a number',
    })
    .int('Month must be an integer')
    .min(1, 'Month must be between 1 and 12')
    .max(12, 'Month must be between 1 and 12'),
  year: z
    .number({
      required_error: 'Year is required',
      invalid_type_error: 'Year must be a number',
    })
    .int('Year must be an integer')
    .min(2000, 'Year must be a valid year')
    .max(2100, 'Year must be a valid year'),
  waterCost: z
    .number({
      required_error: 'Water cost is required',
      invalid_type_error: 'Water cost must be a number',
    })
    .nonnegative('Water cost must be non-negative'),
});

export type CreateElectricityBillInput = z.infer<typeof createElectricityBillSchema>;
export type GenerateInvoicesInput = z.infer<typeof generateInvoicesSchema>;

