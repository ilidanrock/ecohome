"use server";
import { signIn } from "@/auth";
import { CustomError } from "@/auth.config";
import { sendVerificationEmail } from "@/lib/mail";
import { prisma } from "@/prisma";
import { loginSchema } from "@/zod/login-schema";
import { signUpSchema } from "@/zod/register-schema";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { AuthError } from "next-auth";

import { z } from "zod";
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

    await prisma.user.create({
      data: {
        name,
        surname,
        email,
        role,
        password: hashedPassword,
      },
    });

    console.log("Usuario creado exitosamente");

    const token = nanoid();

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const result = await sendVerificationEmail(email, token);
    if (!result.success) {
      throw new CustomError(result.message, "VerifyEmail", 401);
    }

    return {
      success: true,
      message: "Usuario creado exitosamente",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      console.error("AuthError:", Object.entries(error));

      return error.message;
    }
  }
};
