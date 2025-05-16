

import NextAuth, { CredentialsSignin, User, DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getUserFromDb } from "@/services/userService"
import { compare } from "bcryptjs"
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
        let user = null
        let pwHash = null
        const { email, password } = await signInSchema.parseAsync(credentials)
        
        try {
            const userFromDb = await getUserFromDb(email as string)
            
            if (!userFromDb) {
              console.log(Object.values(new CustomError("Usuario no registrado con ese email", "UserNotFound", 401)).toString());
              
              throw new CustomError("Usuario no registrado con ese email", "UserNotFound", 401)
            }
            user = {
                id: userFromDb.id,
                email: userFromDb.email,
                password: userFromDb.password,
                name: userFromDb.name,
                role: userFromDb.role
            }
            pwHash = user?.password

        } catch (error) {
            console.error('Error getting user from database:', error);
            throw error;
        }

        if (!user || !pwHash) {
            throw new Error('User not found')
        }

        const passwordsMatch = await compare(password as string, pwHash)
        
        if (!passwordsMatch) {
            throw  new CustomError()
        }
        
        return user
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
      // Aquí puedes modificar la sesión que recibe el cliente
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
