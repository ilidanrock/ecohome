import { RegisterCommand, RegisterUseCase } from '@/src/core/application/auth/use-cases/register.use-case';
import { signIn, signOut, getSession } from 'next-auth/react';
import { PrismaUserRepository } from '@/src/infrastructure/persistence/prisma/user.repository';


class AuthService {
  private registerUseCase: RegisterUseCase;

  constructor() {
    this.registerUseCase = new RegisterUseCase(new PrismaUserRepository());
  }

  async login(email: string, password: string) {
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    return result;
  }

  async logout() {
    await signOut({ redirect: true, callbackUrl: '/auth/login' });
  }

  async register(data: RegisterCommand) {
    return this.registerUseCase.execute(data);
  }

  async getCurrentUser() {
    const session = await getSession();
    return session?.user || null;
  }

  async isAuthenticated() {
    const session = await getSession();
    return !!session?.user;
  }
}

export const authService = new AuthService();
