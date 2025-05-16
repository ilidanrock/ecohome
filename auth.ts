import NextAuth, { CredentialsSignin, User, DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { signInSchema } from "@/zod/sign-in-schema"


declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
    } & DefaultSession["user"]
  }
  interface User  {
    role: string
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


export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" , placeholder: "example@example.com"},
        password: { label: "Password", type: "password" , placeholder: "********"}
      },
      async authorize(credentials) {
        const { email, password } = await signInSchema.parseAsync(credentials)
        
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const response = await fetch(`${baseUrl}/api/auth/${email}`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new CustomError(error.error || 'Error de autenticación')
        }

         
        return await response.json()
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      
      if (user as {
        id: string
        email: string
        name: string
        role: string
      } | User ) {

        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    }

  }
})
