import { z } from 'zod';

/**
 * Query schema for GET /api/electricity-bills and GET /api/water-bills (admin)
 */
export const listBillsQuerySchema = z.object({
  propertyId: z.string().uuid().optional(),
});

export type ListBillsQuery = z.infer<typeof listBillsQuerySchema>;
