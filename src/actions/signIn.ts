"use server"

import { redirect } from "next/navigation"
import { signIn, auth } from "../../auth"

export async function signInAction(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const session = await auth()
    
    const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
    })
    

    if (result?.message === "Contraseña invalida") {
        return new Error("Contraseña invalida")
    }
    
    if (session?.user.role === "tenant") {
        redirect("/dashboard")
    }

    if (session?.user.role === "admin") {
        redirect("/admin/dashboard")
    }

    
}
