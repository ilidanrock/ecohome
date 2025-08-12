import { CustomError } from '@/lib/auth';
import { EmailRepository } from '@/src/domain/VerifyToken/EmailRepository';
import { ResponseAPI } from '@/types/https';

export class GmailRepository implements EmailRepository {
  async sendEmail(email: string, token: string): Promise<ResponseAPI> {
    const result = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        token,
      }),
    });
    if (!result.ok) {
      throw new CustomError('Error enviando email de verificación', 'VerifyEmail', 401);
    }
    return { success: true };
  }
}
