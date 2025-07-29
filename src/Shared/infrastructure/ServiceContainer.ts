import { UserCreate } from "@/src/application/User/UserCreate";
import { VerifyTokenCreate } from "@/src/application/VerifyToken/VerifyTokenCreate";
import { BcryptHasherRepository } from "@/src/infrastructure/User/BcryptHasherRepository";

import { PrismaUserRepository } from "@/src/infrastructure/User/PrismaUserRepository";
import { PrismaClient } from "@prisma/client";
import { PrismaVerifyTokenRepository } from "@/src/infrastructure/VerifyToken/PrismaVerifyTokenRepository";
import { GmailRepository } from "@/src/infrastructure/VerifyToken/GmailRepository";
import { NanoIdRepository } from "@/src/infrastructure/VerifyToken/NanoIdRepository";
import { VerifyTokenDelete } from "@/src/application/VerifyToken/VerifyTokenDelete";

const userRepository = new PrismaUserRepository(new PrismaClient());
const hasherRepository = new BcryptHasherRepository();
const generatorIdRepository = new NanoIdRepository();
const emailRepository = new GmailRepository();
const verifyTokenRepository = new PrismaVerifyTokenRepository(new PrismaClient());

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
  },
  verifyToken: {
    createVerifyToken: verifyTokenCreate,
    deleteVerifyToken: new VerifyTokenDelete(verifyTokenRepository)
  },
};
