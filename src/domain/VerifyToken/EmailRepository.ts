import type { ResponseAPI } from '@/types';

export interface EmailRepository {
  sendEmail(email: string, token: string): Promise<ResponseAPI>;
}
