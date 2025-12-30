import { PrismaClient, Account as PrismaAccount } from '@prisma/client';
import { VerifyTokenRepository } from '@/src/domain/VerifyToken/VerifyTokenRepository';
import { VerifyToken } from '@/src/domain/VerifyToken/VerifyToken';
import { Account } from '@/src/domain/Account/Account';

export class PrismaVerifyTokenRepository implements VerifyTokenRepository {
  constructor(private prisma: PrismaClient) {}

  async createVerifyToken(verifyToken: VerifyToken): Promise<void> {
    await this.prisma.verificationToken.create({
      data: {
        identifier: verifyToken.identifierUser,
        token: verifyToken.tokenUser,
        expires: verifyToken.expiresAtUser,
      },
    });
  }

  async findVerifyTokenByIdentifier(identifier: string): Promise<VerifyToken | null> {
    const verifyToken = await this.prisma.verificationToken.findUnique({
      where: {
        identifier,
      },
    });
    return verifyToken
      ? new VerifyToken(verifyToken.identifier, verifyToken.expires, verifyToken.token)
      : null;
  }

  async findVerifyTokenByToken(token: string): Promise<VerifyToken | null> {
    const verifyToken = await this.prisma.verificationToken.findFirst({
      where: {
        token,
      },
    });
    return verifyToken
      ? new VerifyToken(verifyToken.identifier, verifyToken.expires, verifyToken.token)
      : null;
  }

  async findAccountByProvider(userId: string, provider: string): Promise<Account | null> {
    const account = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: userId,
        },
      },
    });
    return account ? this.mapToDomain(account) : null;
  }

  async deleteVerifyToken(identifier: string): Promise<void> {
    await this.prisma.verificationToken.delete({
      where: {
        identifier,
      },
    });
  }

  mapToDomain(account: PrismaAccount): Account {
    return new Account(
      account.userId,
      account.type,
      account.provider,
      account.providerAccountId,
      account.refresh_token || '',
      account.access_token || '',
      account.expires_at || 0,
      account.token_type || '',
      account.scope || '',
      account.id_token || '',
      account.session_state || ''
    );
  }
}
