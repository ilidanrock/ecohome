
import { CustomError } from "@/lib/auth";
import { prisma } from "@/prisma";
import { ResponseAPI } from "@/types/https";

/**
 * Crea un token de verificación para un correo electrónico
 * @param email Correo electrónico a verificar
 * @param token Token de verificación
 * @returns Promesa que se resuelve con un objeto con una propiedad `success` que indica si se creó correctamente el token de verificación
 */
export  async function createVerificationTokenEmail (email: string, token: string): Promise<ResponseAPI> {
    
            await prisma.verificationToken.create({
              data: {
                identifier: email,
                token: token,
                expires: new Date(Date.now() + 60 * 60 * 1000),
              },
            });
            
        
    return {success: true}
    
}

/**
 * Elimina un token de verificación para un correo electrónico
 * @param email Correo electrónico asociado al token de verificación
 * @returns Promesa que se resuelve con un objeto con una propiedad `success` que indica si se eliminó correctamente el token de verificación
 */
export async function deleteVerificationTokenEmail(email: string): Promise<ResponseAPI> {

        await prisma.verificationToken.delete({
            where: {
                identifier: email,
            },
        });
        return {success: true}


}

export async function verifyToken(email: string, token: string): Promise<ResponseAPI> {
    const verificationToken = await prisma.verificationToken.findFirst({
        where: {
            identifier: email,
            token,
            expires: { gt: new Date() }
        }
    });

    if (!verificationToken) {
        throw new CustomError("Token inválido o expirado", "InvalidToken", 401);
    }

    return { success: true };
    
}