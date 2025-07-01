"use server";
import { signIn } from "@/auth";
import User from "@/lib/user";
import { VerificationToken } from "@/lib/verificationToken";
import { prisma } from "@/prisma";
import { createUser } from "@/services/user";
import { ResponseAPI } from "@/types/https";
import { role } from "@/types/user";
import { loginSchema } from "@/zod/login-schema";
import { signUpSchema } from "@/zod/register-schema";
import { AuthError } from "next-auth";

import { z } from "zod";

export async function updateUserRole(
  role: role,
  email: string
): Promise<ResponseAPI> {
  try {
    if (!email) {
      return {
        success: false,
        error: "No se proporcionó un correo electrónico",
      };
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

export const loginAction = async (
  values: z.infer<typeof loginSchema>
): Promise<ResponseAPI> => {
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
    return { success: false, error: "An unknown error occurred" };
  }
};

export const registerAction = async (
  values: z.infer<typeof signUpSchema>
): Promise<ResponseAPI> => {
  const { name, surname, email, role, password } = values;

  // Generar un token aleatorio para verificar el correo electrónico

  const { writeTokenInDB, sendEmailWithToken } = new VerificationToken(
    email,
    new Date(Date.now() + 60 * 60 * 1000)
  );
  const { findUser } = new User();

  try {
    const user = await findUser(email);
    if (user) {
      return { success: false, error: "El correo ya esta registrado" };
    }
    await createUser(email, name, surname, role, password);

    await writeTokenInDB();

    await sendEmailWithToken();
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
