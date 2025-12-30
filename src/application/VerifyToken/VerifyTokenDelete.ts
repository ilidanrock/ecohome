import { VerifyTokenRepository } from '@/src/domain/VerifyToken/VerifyTokenRepository';
import { IUserRepository } from '@/src/domain/User/UserRepository';
import { User } from '@/src/domain/User/User';

export class VerifyTokenDelete {
  constructor(private verifyTokenRepository: VerifyTokenRepository) {}

  async execute(identifier: string) {
    return this.verifyTokenRepository.deleteVerifyToken(identifier);
  }
}

export class VerifyUserEmail {
  constructor(
    private verifyTokenRepository: VerifyTokenRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(token: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // Validate token format
    if (token.length < 32 || !/^[a-zA-Z0-9_-]+$/.test(token)) {
      return { success: false, error: 'Token inválido' };
    }

    // Find token
    const verifyToken = await this.verifyTokenRepository.findVerifyTokenByToken(token);
    if (!verifyToken) {
      return { success: false, error: 'Token no encontrado' };
    }

    // Check if token is expired
    if (verifyToken.expiresAtUser < new Date()) {
      return { success: false, error: 'Token expirado' };
    }

    // Find user by email
    const user = await this.userRepository.findUserByEmail(verifyToken.identifierUser);
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // Check if already verified
    if (user.emailVerified) {
      return { success: false, error: 'Correo ya verificado' };
    }

    // Verify email
    const verifiedUser = await this.userRepository.verifyUserEmail(verifyToken.identifierUser);

    // Delete token
    await this.verifyTokenRepository.deleteVerifyToken(verifyToken.identifierUser);

    return { success: true, user: verifiedUser };
  }
}
