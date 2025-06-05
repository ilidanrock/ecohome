import { z } from "zod"

export const signUpSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  surname: z.string().min(2,"El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  role: z.enum(['USER', 'ADMIN'], {
    errorMap: () => ({ message: "Rol inválido" }),
  }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(20, "Password must be at most 20 characters long")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character ( @$!%*?& )"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})
