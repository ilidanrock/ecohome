import { UserCreate } from '@/src/application/User/UserCreate';
import { VerifyTokenCreate } from '@/src/application/VerifyToken/VerifyTokenCreate';
import { BcryptHasherRepository } from '@/src/infrastructure/User/BcryptHasherRepository';

import { PrismaUserRepository } from '@/src/infrastructure/User/PrismaUserRepository';
import { PrismaVerifyTokenRepository } from '@/src/infrastructure/VerifyToken/PrismaVerifyTokenRepository';
import { GmailRepository } from '@/src/infrastructure/VerifyToken/GmailRepository';
import { NanoIdRepository } from '@/src/infrastructure/VerifyToken/NanoIdRepository';
import { VerifyTokenDelete } from '@/src/application/VerifyToken/VerifyTokenDelete';
import { UserLogin } from '@/src/application/User/UserLogin';
import { UserFind } from '@/src/application/User/UserFind';
import { AccountOAuthSignIn } from '@/src/application/Account/AccountOAuthSignIn';
import { PrismaAccountsRepository } from '@/src/infrastructure/Accounts/PrismaAccountsRepository';
import { GetConsumptionData } from '@/src/application/Consumption/GetConsumptionData';
import { PrismaConsumptionRepository } from '@/src/infrastructure/Consumption/PrismaConsumptionRepository';
import { prisma } from '@/prisma';

const userRepository = new PrismaUserRepository(prisma);
const hasherRepository = new BcryptHasherRepository();
const generatorIdRepository = new NanoIdRepository();
const emailRepository = new GmailRepository();
const verifyTokenRepository = new PrismaVerifyTokenRepository(prisma);
const accountRepository = new PrismaAccountsRepository(prisma);
const consumptionRepository = new PrismaConsumptionRepository(prisma);

const verifyTokenCreate = new VerifyTokenCreate(
  verifyTokenRepository,
  emailRepository,
  generatorIdRepository
);

export const serviceContainer = {
  user: {
    createUser: new UserCreate(userRepository, hasherRepository, verifyTokenCreate),
    userLogin: new UserLogin(userRepository, hasherRepository, emailRepository),
    userFind: new UserFind(userRepository),
  },
  verifyToken: {
    createVerifyToken: verifyTokenCreate,
    deleteVerifyToken: new VerifyTokenDelete(verifyTokenRepository),
  },
  account: {
    accountOAuthSignIn: new AccountOAuthSignIn(accountRepository, userRepository),
  },
  consumption: {
    getData: new GetConsumptionData(consumptionRepository),
  },
};
