
import type { NextAuthConfig, DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { loginSchema } from "./zod/login-schema"
import compare from "bcryptjs"
import { prisma } from "./prisma"
import { nanoid } from 'nanoid'

// Extender tipos de NextAuth
declare module "next-auth" {
  interface User {
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      role?: string;
    } & DefaultSession["user"]
    accessToken?: string;
  }
}



export class CustomError extends Error {
  code: string;
  status: number;
  message: string;

  constructor(message = "Contraseña invalida", code = "InvalidCredentials", status = 401) {

    super()
    this.code = code;
    this.status = status;
    this.message = message;
  }
  
  toString(){
    return this.message
  }
}

// Configuración de NextAuth
const authConfig: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'USER' // Rol por defecto para usuarios de Google
        };
      }
    }),
        Credentials({
  
      authorize: async (credentials) => {
       

        const {email, password} = await loginSchema.parseAsync(credentials)

        const user = await prisma.user.findFirst({
          where: {
            email: email}
        })
        if (!user || !user.password) {
          throw new CustomError("Email no encontrado", "InvalidCredentials", 401)
        }
        const isPasswordValid = await compare.compare(password, user.password)

        if (!isPasswordValid) {
          throw new CustomError("Contraseña invalida", "InvalidCredentials", 401)
        }

        if (!user.emailVerified) {
          const verifyTokenExist = await prisma.verificationToken.findFirst({
            where: {
              identifier: user.email
            }
          })
          if (verifyTokenExist?.identifier) {
            await prisma.verificationToken.delete({
              where: {
                identifier: user.email
              }
            })
          }
          const token = nanoid()
          await prisma.verificationToken.create({
            data: {
              identifier: user.email,
              token,
              expires: new Date(Date.now() + 60 * 60 * 1000)
            }
          })
          // const result = await sendVerificationEmail(user.email, token)
          // if (!result.success) {
          //   throw new CustomError(result.message, "VerifyEmail", 401)
          // }
          const result = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/send-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
              token,
            }),
          })
          if (!result.ok) {
            throw new CustomError(`Error enviando email de verificación : ${
              result.statusText } , ${process.env.NEXTAUTH_URL}/api/auth/send-email, ${user.email} , ${token}`, "VerifyEmail", 401, )
          }
          throw new CustomError("Verifica tu correo", "VerifyEmail", 401)
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role : user.role,

        }
        
      },
      
      
    }),
    
    
  ],
  session: {
    strategy: "jwt" as const,
  },
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
  callbacks: {
    async jwt({ token, user, account }) {
      // Pasar el rol del usuario al token
      if (user) {
        token.role = user.role;
      }
      // Pasar el access_token de Google al token
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Pasar el rol del token a la sesión
      if (session.user) {
        session.user.id = token.sub || '';
        session.user.role = token.role as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
};

export default authConfig;