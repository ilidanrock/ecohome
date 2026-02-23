import { z } from 'zod';

const roleEnum = z.enum(['USER', 'ADMIN', 'NULL']);

export const usersQuerySchema = z.object({
  role: roleEnum.optional(),
  search: z
    .string()
    .trim()
    .optional()
    .transform((s) => (s === '' ? undefined : s)),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type UsersQueryInput = z.infer<typeof usersQuerySchema>;
