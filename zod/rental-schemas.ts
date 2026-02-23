import { z } from 'zod';

export const createRentalBodySchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  propertyId: z.string().min(1, 'propertyId is required'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
});

export type CreateRentalBodyInput = z.infer<typeof createRentalBodySchema>;

export const updateRentalBodySchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional().nullable(),
  })
  .refine((data) => data.startDate !== undefined || data.endDate !== undefined, {
    message: 'At least one of startDate or endDate must be provided',
  });

export type UpdateRentalBodyInput = z.infer<typeof updateRentalBodySchema>;
