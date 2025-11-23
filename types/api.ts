/**
 * API Types
 *
 * Types for API responses and error handling.
 * Used in API routes, server actions, and error handling.
 */

/**
 * Standard API response format
 */
export type ResponseAPI = {
  success: boolean;
  error?: string;
  message?: string & ErrorAuthTypes;
};

/**
 * Authentication error types
 * These are the specific error messages that can be returned from auth operations
 */
export type ErrorAuthTypes =
  | 'Contraseña invalida'
  | 'Verifica tu correo'
  | 'Email no encontrado'
  | 'Usuario registrado con Google'
  | 'Error enviando email de verificación'
  | 'Error creando token de verificación'
  | 'Error eliminando token de verificación'
  | 'Error verificando token de verificación'
  | 'Token inválido o expirado'
  | 'Correo ya registrado'
  | 'Error al crear el usuario'
  | 'Error al actualizar el rol del usuario'
  | 'Email no verificado'
  | 'Password no proporcionado';

/**
 * Payment API request/response types
 */
export interface CreatePaymentRequest {
  type: 'rental' | 'invoice';
  rentalId?: string;
  invoiceId?: string;
  amount: number;
  paidAt: string; // ISO date string
  paymentMethod: 'YAPE' | 'CASH' | 'BANK_TRANSFER';
  reference?: string | null;
  receiptUrl?: string | null;
}

export interface PaymentResponse {
  id: string;
  rentalId: string | null;
  invoiceId: string | null;
  amount: number;
  paidAt: string; // ISO date string
  paymentMethod: 'YAPE' | 'CASH' | 'BANK_TRANSFER';
  reference: string | null;
  receiptUrl: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export type PaymentsResponse = PaymentResponse[];
