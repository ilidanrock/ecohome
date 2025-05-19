"use server"

import { redirect } from "next/navigation"
import { signIn, auth } from "../../auth"
import { AuthError } from "next-auth"

export async function signInAction(formData: FormData) {
    try {
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const session = await auth()
        
        await signIn("credentials", {
            email,
            password,
            redirect: false,
        })
        
        
        if (session?.user.role === "tenant") {
            
            redirect("/dashboard")
        }
    
        if (session?.user.role === "admin") {
            redirect("/admin/dashboard")
        }
    } catch (error) {
        if (error instanceof AuthError) {
        
            switch (error.type) {
                case "CredentialsSignin":
                    
                    return "Credenciales invalidos"
            
                default:
                    return "Algo no fue bien en la autenticacion"
            }
        
        } 
        throw error
    }

    
}
