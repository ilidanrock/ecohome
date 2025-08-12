import { IUserRepository } from '@/src/domain/User/UserRepository';
import { HasherRepository } from '@/src/domain/User/HasherRepository';
import { CustomError } from '@/lib/auth';
import { VerifyTokenRepository } from '@/src/domain/VerifyToken/VerifyTokenRepository';
import { VerifyToken } from '@/src/domain/VerifyToken/VerifyToken';
import { EmailRepository } from '@/src/domain/VerifyToken/EmailRepository';

export class UserLogin {
  constructor(
    private userRepository: IUserRepository,
    private hasherRepository: HasherRepository,
    private verifyTokenRepository: VerifyTokenRepository,
    private emailRepository: EmailRepository
  ) {}
  /**
   * Authenticates a user by verifying their email and password, and handles email verification if necessary.
   * Throws specific errors for invalid credentials or if the user is registered via Google.
   *
   * Args:
   *   email: The user's email address.
   *   password: The user's password.
   *   verifyToken: The verification token to use if email verification is required.
   *
   * Returns:
   *   The authenticated user object if credentials are valid.
   *
   * Raises:
   *   CustomError: If the user is not found, registered with Google, or the password is invalid.
   */
  async execute(email: string, password: string, verifyToken: VerifyToken) {
    const findUser = await this.userRepository.findUserByEmail(email);
    if (!findUser) {
      throw new CustomError('Email no encontrado', 'InvalidCredentials', 401);
    }
    if (findUser.password === null) {
      throw new CustomError('Usuario registrado con Google', 'USER_ALREADY_EXISTS', 401);
    }
    const isPasswordValid = await this.hasherRepository.compare(password, findUser.password);
    if (!isPasswordValid) {
      throw new CustomError('Contraseña invalida', 'InvalidCredentials', 401);
    }
    if (!findUser.emailVerified) {
      const verifyTokenExist = await this.verifyTokenRepository.findVerifyTokenByIdentifier(email);
      if (verifyTokenExist?.identifier) {
        await this.verifyTokenRepository.deleteVerifyToken(email);
      }
      await this.verifyTokenRepository.createVerifyToken(verifyToken);
      await this.emailRepository.sendEmail(email, verifyToken.tokenUser);
    }
    return findUser;
  }
}
