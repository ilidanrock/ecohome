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

export const propertiesListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional().transform((s) => (s === '' ? undefined : s)),
});

export type PropertiesListQueryInput = z.infer<typeof propertiesListQuerySchema>;
