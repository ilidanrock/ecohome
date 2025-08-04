import { ResponseAPI } from '@/types/https';

export interface EmailRepository {
  sendEmail(email: string, token: string): Promise<ResponseAPI>;
}
