
import { AuthError, type NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { loginSchema } from "./zod/login-schema"
import compare from "bcryptjs"
import { prisma } from "./prisma"
import { nanoid } from 'nanoid'
import { sendVerificationEmail } from "./lib/mail"

// Extend User and AdapterUser types to include 'role'
declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      role?: string;
      name?: string | null;
      email?: string | null;
    }
  }
}

export class CustomError extends AuthError   {
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

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [
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
          const result = await sendVerificationEmail(user.email, token)
          if (!result.success) {
            throw new CustomError(result.message, "VerifyEmail", 401)
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },

  },
    trustHost: true
} satisfies NextAuthConfig