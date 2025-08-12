import { VerifyTokenRepository } from '@/src/domain/VerifyToken/VerifyTokenRepository';

export class VerifyTokenDelete {
  constructor(private verifyTokenRepository: VerifyTokenRepository) {}

  async execute(identifier: string) {
    return this.verifyTokenRepository.deleteVerifyToken(identifier);
  }
}
