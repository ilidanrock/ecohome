import { object, string } from "zod";

export const signInSchema = object({
  email: string({ required_error: "El correo es obligatorio" })
    .min(1, "El correo es obligatorio")
    .email("El correo no es válido"),
    
  password: string({ required_error: "La contraseña es obligatoria" })
    .min(1, "La contraseña es obligatoria")
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(32, "La contraseña no debe tener más de 32 caracteres"),
});