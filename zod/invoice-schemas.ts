import { z } from 'zod';

/**
 * Query schema for GET /api/invoices (tenant)
 */
export const listInvoicesQuerySchema = z.object({
  status: z.enum(['PAID', 'UNPAID']).optional(),
});

export type ListInvoicesQuery = z.infer<typeof listInvoicesQuerySchema>;
