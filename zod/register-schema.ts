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
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(32, "La contraseña no puede tener más de 32 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})
