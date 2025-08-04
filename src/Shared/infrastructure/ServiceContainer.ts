import { UserCreate } from "@/src/application/User/UserCreate";
import { VerifyTokenCreate } from "@/src/application/VerifyToken/VerifyTokenCreate";
import { BcryptHasherRepository } from "@/src/infrastructure/User/BcryptHasherRepository";

import { PrismaUserRepository } from "@/src/infrastructure/User/PrismaUserRepository";
import { PrismaClient } from "@prisma/client";
import { PrismaVerifyTokenRepository } from "@/src/infrastructure/VerifyToken/PrismaVerifyTokenRepository";
import { GmailRepository } from "@/src/infrastructure/VerifyToken/GmailRepository";
import { NanoIdRepository } from "@/src/infrastructure/VerifyToken/NanoIdRepository";
import { VerifyTokenDelete } from "@/src/application/VerifyToken/VerifyTokenDelete";
import { UserLogin } from "@/src/application/User/UserLogin";
import { UserFind } from "@/src/application/User/UserFind";
import { AccountOAuthSignIn } from "@/src/application/Account/AccountOAuthSignIn";
import { PrismaAccountsRepository } from "@/src/infrastructure/Accounts/PrismaAccountsRepository";


const userRepository = new PrismaUserRepository(new PrismaClient());
const hasherRepository = new BcryptHasherRepository();
const generatorIdRepository = new NanoIdRepository();
const emailRepository = new GmailRepository();
const verifyTokenRepository = new PrismaVerifyTokenRepository(new PrismaClient());
const accountRepository = new PrismaAccountsRepository(new PrismaClient());

const verifyTokenCreate = new VerifyTokenCreate(
  verifyTokenRepository,
  emailRepository,
  generatorIdRepository
);

export const serviceContainer = {
  user: {
    createUser: new UserCreate(
      userRepository,
      hasherRepository,
      verifyTokenCreate
    ),
    userLogin: new UserLogin(
      userRepository,
      hasherRepository,
      verifyTokenRepository,
      emailRepository
    ),
    userFind: new UserFind(userRepository),
  },
  verifyToken: {
    createVerifyToken: verifyTokenCreate,
    deleteVerifyToken: new VerifyTokenDelete(verifyTokenRepository)
  },
  account: {
    accountOAuthSignIn: new AccountOAuthSignIn(
      accountRepository,
      userRepository
    ),
  },
};
