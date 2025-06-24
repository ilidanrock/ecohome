
"use server";
import { signIn } from "@/auth";
import { CustomError } from '@/auth.config';
import { prisma } from "@/prisma";
import { loginSchema } from "@/zod/login-schema";
import { signUpSchema } from "@/zod/register-schema";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { AuthError } from "next-auth";

import { z } from "zod";

export async function updateUserRole(role: "USER" | "ADMIN", email: string) {
  try {
    if (!email) {
      return { error: "No se proporcionó un correo electrónico" };
    }

    console.log("Updating user role for email:", email);
    console.log("Updating user role to:", role);
    

    // Actualizar el rol del usuario
    await prisma.user.update({
      where: { email },
      data: { role },
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { error: "Error al actualizar el rol del usuario" };
  }
}

export const loginAction = async (values: z.infer<typeof loginSchema>) => {
  try {
    await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

  } catch (error) {

    if (error instanceof AuthError) {
      return error.message;
    }
  }
};

export const registerAction = async (values: z.infer<typeof signUpSchema>) => {
  const { name, surname, email, role, password } = values;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      return {
        error: "El correo ya esta registrado",
      };
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

    const token = nanoid();

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    
    const result = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        token,
      }),
    })
    if (!result.ok) {
      throw new CustomError("Error enviando email de verificación", "VerifyEmail", 401)
    }

    return {
      success: true,
      message: "Usuario creado exitosamente",
    };
  } catch (error) {
    if (error instanceof AuthError) {

      return error.message;
    }
  }
};
