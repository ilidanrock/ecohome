export type ResponseAPI = {
    success: boolean;
    error?: string;
    message?: string | ErrorAuthTypes
}

export type ErrorAuthTypes = "Contraseña invalida" | "Verifica tu correo" | "Email no encontrado" | "Usuario registrado con Google" | "Error enviando email de verificación" | "Error creando token de verificación" | "Error eliminando token de verificación" | "Error verificando token de verificación" | "Token inválido o expirado" | "Correo ya registrado" | "Error al crear el usuario" | "Error al actualizar el rol del usuario"
