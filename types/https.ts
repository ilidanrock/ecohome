export type ResponseAPI = {
    success: boolean;
    error?: string;
    message?: string | ErrorAuthTypes
}

export type ErrorAuthTypes = "Contraseña invalida" | "Verifica tu correo" | "Email no encontrado" | "Usuario registrado con Google" | "Error enviando email de verificación" | "Error creando token de verificación"
