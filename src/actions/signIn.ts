"use server"

import { redirect } from "next/navigation"
import { signIn } from "../../auth"


export async function signInAction(formData: FormData) {
    

        const email = formData.get("email") as string
        const password = formData.get("password") as string
    
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        })
        
    
        if (result?.message === "Contraseña invalida") {
            return new Error("Contraseña invalida")
        }
    
        redirect("/dashboard")
    

}