'use server';
import { signIn } from '@/auth';
import { CustomError } from '@/lib/auth';
import { prisma } from '@/prisma';

import { User } from '@/src/domain/User/User';
import { serviceContainer } from '@/src/Shared/infrastructure/ServiceContainer';
import type { ResponseAPI, Role } from '@/types';
import { loginSchema } from '@/zod/login-schema';
import { signUpSchema } from '@/zod/register-schema';
import { AuthError } from 'next-auth';

import { z } from 'zod';

export async function updateUserRole(role: Role, email: string): Promise<ResponseAPI> {
  try {
    if (!email) {
      return {
        success: false,
        error: 'No se proporcionó un correo electrónico',
      };
    }

    // Actualizar el rol del usuario
    await prisma.user.update({
      where: { email },
      data: { role },
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: 'Error al actualizar el rol del usuario' };
  }
}

export const loginAction = async (values: z.infer<typeof loginSchema>): Promise<ResponseAPI> => {
  try {
    await signIn('credentials', {
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

export const registerAction = async (
  values: z.infer<typeof signUpSchema>
): Promise<ResponseAPI> => {
  const { name, surname, email, role, password } = values;

  try {
    const user = new User(name, surname, password, email, null, null, role, new Date(), new Date());
    await serviceContainer.user.createUser.execute(user);

    return { success: true };
  } catch (error) {
    if (error instanceof CustomError) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Error al crear el usuario' };
  }
};
