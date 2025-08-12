import { AuthError } from 'next-auth';
import { ErrorAuthTypes } from '../types/https';

export class CustomError extends AuthError {
  code: string;
  status: number;
  message: ErrorAuthTypes | string;

  constructor(
    message: ErrorAuthTypes = 'Contraseña invalida',
    code = 'InvalidCredentials',
    status = 401
  ) {
    super();
    this.code = code;
    this.status = status;
    this.message = message;
  }

  toString() {
    return this.message;
  }
}
