import { z } from 'zod';

export const createPropertySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').trim(),
  address: z.string().min(1, 'La dirección es requerida').trim(),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

export const updatePropertySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').trim(),
  address: z.string().min(1, 'La dirección es requerida').trim(),
});

export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
