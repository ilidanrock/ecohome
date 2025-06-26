import type { NextAuthConfig, DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { loginSchema } from "./zod/login-schema";
import compare from "bcryptjs";
import { prisma } from "./prisma";
import { nanoid } from "nanoid";
import { CustomError } from "./lib/auth";
import { createVerificationTokenEmail, sendEmail } from "./services/verify-email";

// Extender tipos de NextAuth
declare module "next-auth" {
  interface User {
    role?: string;
    token?: string;
  }

  interface Session {
    user: {
      id: string;
      role?: string;
      token?: string;
    } & DefaultSession["user"];
    accessToken?: string;
  }
}

// Configuración de NextAuth
const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.given_name,
          surname: profile.family_name,
          email: profile.email,
          emailVerified: profile.email_verified,
          image: profile.picture,
        };
      },
    }),
    Credentials({
      authorize: async (credentials) => {
        const { email, password } = await loginSchema.parseAsync(credentials);
        const token = nanoid();

        const user = await prisma.user.findFirst({
          where: {
            email: email,
          },
        });

        if (!user) {
          throw new CustomError(
            "Email no encontrado",
            "InvalidCredentials",
            401
          );
        }

        if (!user.password) {
          throw new CustomError(
            "Usuario registrado con Google",
            "InvalidCredentials",
            401
          );
        }
        const isPasswordValid = await compare.compare(password, user.password!);

        if (!isPasswordValid) {
          throw new CustomError(
            "Contraseña invalida",
            "InvalidCredentials",
            401
          );
        }

        if (!user.emailVerified) {
          const verifyTokenExist = await prisma.verificationToken.findFirst({
            where: {
              identifier: user.email,
            },
          });
          if (verifyTokenExist?.identifier) {
            await prisma.verificationToken.delete({
              where: {
                identifier: user.email,
              },
            });
          }

          await createVerificationTokenEmail(user.email, token);

          await sendEmail(user.email, token);
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  trustHost: true,
  events: {
    async linkAccount({ user, account }) {
      // Este evento se dispara cuando se vincula una cuenta exitosamente
      console.log(
        `Cuenta de ${account?.provider} vinculada para el usuario:`,
        user.email
      );
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      // Permitir el inicio de sesión con credenciales o si el usuario ya existe
      if (account?.provider === "credentials") {
        return true;
      }

      // Para proveedores OAuth como Google
      if (account?.provider === "google" && user?.email) {
        // Buscar si el usuario ya existe
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser) {
          // Si el usuario existe, vincular la cuenta si no está ya vinculada
          const existingAccount = await prisma.account.findFirst({
            where: {
              userId: existingUser.id,
              provider: account.provider,
            },
          });

          if (!existingAccount) {
            // Vincular la cuenta de Google al usuario existente
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId as string,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state as string,
              },
            });
          }
          return true;
        }
      }
      return true;
    },
    jwt: async ({ token, user, account, trigger, session }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        // Asegurarnos de que el email esté en el token
        if (user.email) {
          token.email = user.email;
        }
      }
      if (trigger === "update") {
        token.role = session.user.role;
      }
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.accessToken = token.accessToken as string;

        session.user = {
          ...session.user,
          email: token.email as string,
          name: token.name as string,
          image: token.picture as string,
          token: JSON.stringify(token),
        };
      }
      return session;
    },
  },
};

export default authConfig;
