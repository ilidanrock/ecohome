import { Account } from './Account';

export interface IAccountRepository {
  findAccountsByUserId(userId: string): Promise<Account[]>;
  createAccount(account: Account): Promise<Account>;
  findAccountByProvider(
    userId: string,
    provider: string,
    providerAccountId: string
  ): Promise<Account | null>;
}
