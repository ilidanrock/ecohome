
"use server";
import { signIn } from "@/auth";
import { prisma } from "@/prisma";
import { createVerificationTokenEmail, sendEmail } from "@/services/verify-email";
import { ResponseAPI } from "@/types/https";
import { role } from "@/types/user";
import { loginSchema } from "@/zod/login-schema";
import { signUpSchema } from "@/zod/register-schema";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { AuthError } from "next-auth";

import { z } from "zod";

export async function updateUserRole(role: role, email: string): Promise<ResponseAPI> {
  try {
    if (!email) {
      return { success: false, error: "No se proporcionó un correo electrónico" };
    }
    

    // Actualizar el rol del usuario
    await prisma.user.update({
      where: { email },
      data: { role },
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Error al actualizar el rol del usuario" };
  }
}

export const loginAction = async (values: z.infer<typeof loginSchema>): Promise<ResponseAPI> => {
  try {
    await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {

    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unknown error occurred' };
  }
};

export const registerAction = async (values: z.infer<typeof signUpSchema>): Promise<ResponseAPI> => {
  const { name, surname, email, role, password } = values;

  // Generar un token aleatorio para verificar el correo electrónico
  const token = nanoid();

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      return { success: false, error: "El correo ya esta registrado" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario y su cuenta de credenciales en una transacción
    await prisma.$transaction(async (tx) => {
      // 1. Crear el usuario
      const user = await tx.user.create({
        data: {
          name,
          surname,
          email,
          role,
          password: hashedPassword
        },
      });

      // 2. Crear la cuenta de credenciales
      await tx.account.create({
        data: {
          userId: user.id,
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: user.id, // Usamos el ID de usuario como providerAccountId
        },
      });
    });

  await createVerificationTokenEmail(email, token);
    
  await sendEmail(email, token);

  } catch (error) {
    if (error instanceof AuthError) {

      return { success: false, error: error.message };
    }

    return { success: false, error: "Error al crear el usuario" };
  }
  return {
    success: true,
    message: "Usuario creado exitosamente",
  };
};
