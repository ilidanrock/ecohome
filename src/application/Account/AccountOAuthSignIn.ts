import { IAccountRepository } from '@/src/domain/Account/IAccountRepository';

import { IUserRepository } from '@/src/domain/User/UserRepository';
import { User, Account } from 'next-auth';

export class AccountOAuthSignIn {
  constructor(
    private accountRepository: IAccountRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(user: User, account: Account) {
    if (account?.provider === 'credentials') {
      return true;
    }
    if (account?.provider === 'google' && user?.email) {
      // Buscar si el usuario ya existe
      const existingUser = await this.userRepository.findUserByEmail(user.email);

      if (existingUser && existingUser.id) {
        // Si el usuario existe, vincular la cuenta si no está ya vinculada
        const existingAccount = await this.accountRepository.findAccountByProvider(
          existingUser.id,
          account.provider,
          account.providerAccountId
        );

        if (!existingAccount) {
          // Vincular la cuenta de Google al usuario existente
          await this.accountRepository.createAccount({
            userId: existingUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            refresh_token: account.refresh_token || '',
            access_token: account.access_token || '',
            expires_at: account.expires_at || 0,
            token_type: account.token_type || '',
            scope: account.scope || '',
            id_token: account.id_token || '',
            session_state: account.session_state ? String(account.session_state) : '',
          });
        }
        return true;
      }
    }
    return true;
  }
}
