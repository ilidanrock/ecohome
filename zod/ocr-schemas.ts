import { z } from 'zod';

export const extractMeterReadingSchema = z.object({
  consumptionId: z.string().uuid('Consumption ID must be a valid UUID'),
  imageUrl: z.string().url('Image URL must be a valid URL'),
});

export type ExtractMeterReadingInput = z.infer<typeof extractMeterReadingSchema>;
