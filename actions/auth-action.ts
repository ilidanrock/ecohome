"use server"
import { signIn } from "@/auth"
import { prisma } from "@/prisma"
import { loginSchema } from "@/zod/login-schema"
import { signUpSchema } from "@/zod/register-schema"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"

import { z } from "zod"
export const loginAction = async (values : z.infer<typeof loginSchema>) => {
    try {
        await signIn("credentials", {
            email: values.email,
            password: values.password,
            redirect: false,
        })
    } catch (error) {
        if (error instanceof AuthError) {
            console.error("AuthError:", Object.entries(error))
  
            switch (error.type) {
                case "CredentialsSignin":
                    
                    return "Invalid credentials"
            
                default:
                    return "An error occurred during sign in"
            }
        }
    }
}

export const registerAction = async (values : z.infer<typeof signUpSchema>) => {
    const { name, surname, email, role, password } = values
    try {

        const user = await prisma.user.findUnique({
            where: {
                email,
            }
        })
        
        if (user) {
            return {
                error: "User already exists"
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                name,
                surname,
                email,
                role,
                password: hashedPassword,
            }
        })

        await signIn("credentials", {
            email,
            password,
            redirect: false,
        })
        return {
            success: "User created successfully"
        }

    } catch (error) {
        if (error instanceof AuthError) {
            console.error("AuthError:", Object.entries(error))
  
            switch (error.type) {
                case "CredentialsSignin":
                    
                    return "Invalid credentials"
            
                default:
                    return "An error occurred during sign in"
            }
        }
    }
}