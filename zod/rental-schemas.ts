import { z } from 'zod';

export const createRentalBodySchema = z
  .object({
    userId: z.string().min(1, 'userId is required'),
    propertyId: z.string().min(1, 'propertyId is required'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional().nullable(),
  })
  .refine((data) => data.endDate == null || data.endDate >= data.startDate, {
    message: 'La fecha de fin debe ser igual o posterior a la fecha de inicio',
    path: ['endDate'],
  });

export type CreateRentalBodyInput = z.infer<typeof createRentalBodySchema>;

export const updateRentalBodySchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional().nullable(),
  })
  .refine((data) => data.startDate !== undefined || data.endDate !== undefined, {
    message: 'At least one of startDate or endDate must be provided',
  })
  .refine(
    (data) => {
      if (data.startDate !== undefined && data.endDate != null) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: 'La fecha de fin debe ser igual o posterior a la fecha de inicio',
      path: ['endDate'],
    }
  );

export type UpdateRentalBodyInput = z.infer<typeof updateRentalBodySchema>;
