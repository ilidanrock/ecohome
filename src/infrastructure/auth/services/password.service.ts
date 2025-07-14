import { hash, compare } from 'bcryptjs';
import { IPasswordService } from '../../../core/domain/auth/ports/password.service.port';

export class PasswordService implements IPasswordService {
  private readonly SALT_ROUNDS = 10;

  async hashPassword(password: string): Promise<string> {
    try {
      return await hash(password, this.SALT_ROUNDS);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return false;
    }
  }
}
