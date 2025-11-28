import { z } from 'zod';

export const updateMeterReadingSchema = z.object({
  energyReading: z
    .number({
      required_error: 'Energy reading is required',
      invalid_type_error: 'Energy reading must be a number',
    })
    .positive('Energy reading must be positive')
    .max(10000000, 'Energy reading cannot exceed 10,000,000 kWh'),
  previousReading: z
    .number({
      invalid_type_error: 'Previous reading must be a number',
    })
    .nonnegative('Previous reading must be non-negative')
    .max(10000000, 'Previous reading cannot exceed 10,000,000 kWh')
    .nullable()
    .optional(),
});

export type UpdateMeterReadingInput = z.infer<typeof updateMeterReadingSchema>;
