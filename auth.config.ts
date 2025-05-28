
import { CredentialsSignin, type NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { loginSchema } from "./zod/login-schema"
import compare from "bcryptjs"
import { prisma } from "./prisma"

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

export class CustomError extends CredentialsSignin {
  code: string;
  status: number;

  constructor(message = "Contraseña invalida", code = "InvalidCredentials", status = 401) {
    super(message);
    this.name = "CustomError";
    this.code = code;
    this.status = status;
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
          throw new CustomError("Invalid credentials")
        }
        const isPasswordValid = await compare.compare(password, user.password)

        if (!isPasswordValid) {
          throw new Error("Invalid password")
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