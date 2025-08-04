import { PrismaClient , Account as PrismaAccount } from "@prisma/client";
import { IAccountRepository } from "@/src/domain/Account/IAccountRepository";
import { Account } from "@/src/domain/Account/Account";



export class PrismaAccountsRepository implements IAccountRepository {
    constructor(
        private prismaClient: PrismaClient
    ) {}

    async createAccount(account: Account): Promise<Account> {
        const newAccount = await this.prismaClient.account.create({
            data: {
                userId: account.userId,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
            },
        });
        return this.mapToDomain(newAccount);
    }
    
    async findAccountsByUserId(userId: string): Promise<Account[]> {
        const accounts = await this.prismaClient.account.findMany({
            where: {
                userId,
            },
        });
        return accounts.map(account => this.mapToDomain(account)); 
    }

    async findAccountByProvider(
        userId: string, 
        provider: string, 
        providerAccountId: string
    ): Promise<Account | null> {
        const account = await this.prismaClient.account.findFirst({
            where: {
                userId,
                provider,
                providerAccountId,
            },
        });
        return account ? this.mapToDomain(account) : null;
    }

    mapToDomain(account: PrismaAccount): Account {
        return new Account(account.userId, account.type, account.provider, account.providerAccountId, account.refresh_token || '', account.access_token || '', account.expires_at || 0, account.token_type || '', account.scope || '', account.id_token || '', account.session_state || '');
    }

}