
import { sendEmail } from "@/services/verify-email";
import { nanoid } from "nanoid";
import { errorHandle } from "./decorators"
import { createVerificationTokenEmail, deleteVerificationTokenEmail, verifyToken } from "@/services/verificationToken";


export class VerificationToken  {
    private identifier: string;
    private token: string;
    private expires: Date;

    constructor(identifier: string, expires: Date) {
        this.identifier = identifier;
        this.token = nanoid();
        this.expires = expires;
        this.writeTokenInDB = this.writeTokenInDB.bind(this);
        this.sendEmailWithToken = this.sendEmailWithToken.bind(this);
    }


    /**
     * Escribe el token de verificación en la base de datos.
     */
    @errorHandle("Error creando token de verificación", 500)
    async writeTokenInDB() {
        await createVerificationTokenEmail(this.identifier, this.token);
    }

    /**
     * Envía el correo de verificación.
     */
    @errorHandle("Error enviando email de verificación", 500)
    async sendEmailWithToken() {
        await sendEmail(this.identifier, this.token);
    }

    /**
     * Elimina un token de verificación existente para un identificador.
     * @param identifier Identificador del token a eliminar.
     */
    @errorHandle("Error eliminando token de verificación", 500)
    static async deleteExistingToken(identifier: string) {
        await deleteVerificationTokenEmail(identifier);
    }

    /**
     * Verifica si un token es válido.
     * @param identifier Identificador del token.
     * @param token Token a verificar.
     */
    @errorHandle("Error verificando token de verificación", 500)
    static async verifyToken(identifier: string, token: string) {
        await verifyToken(identifier, token);
    }
}