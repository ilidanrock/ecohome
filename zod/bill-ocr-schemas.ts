import { z } from 'zod';

export const extractBillDataSchema = z.object({
  fileUrl: z.string().url('File URL must be a valid URL'),
});

export type ExtractBillDataInput = z.infer<typeof extractBillDataSchema>;
