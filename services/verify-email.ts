
import { CustomError } from "@/lib/auth"
import { prisma } from "@/prisma"
import { ResponseAPI } from "@/types/https"


/**
 * Envia un correo electrónico de verificación
 * @param email Correo electrónico a enviar
 * @param token Token de verificación
 * @returns Promesa que se resuelve con un objeto con una propiedad `success` que indica si se envió correctamente el correo electrónico
 */
export  async function sendEmail(email: string, token: string): Promise<ResponseAPI> {

        const result = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/send-email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                token,
            }),
        })
        if (!result.ok) {
            throw new CustomError("Error enviando email de verificación", "VerifyEmail", 401)
        }
        return {success: true}

}

/**
 * Crea un token de verificación para un correo electrónico
 * @param email Correo electrónico a verificar
 * @param token Token de verificación
 * @returns Promesa que se resuelve con un objeto con una propiedad `success` que indica si se creó correctamente el token de verificación
 */
export  async function createVerificationTokenEmail (email: string, token: string): Promise<ResponseAPI> {
    try {
            await prisma.verificationToken.create({
              data: {
                identifier: email,
                token: token,
                expires: new Date(Date.now() + 60 * 60 * 1000),
              },
            });
            
        
    } catch (error: unknown){
        if (error) {
            throw new CustomError("Error creando token de verificación", "VerifyEmail", 401)
        }

    }
    return {success: true}
    
}