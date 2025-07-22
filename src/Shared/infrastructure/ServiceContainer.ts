
import { UserCreate } from "@/src/application/UserCreate/UserCreate";
import { BcryptHasherRepository } from "@/src/infrastructure/BcryptHasherRepository";

import { PrismaUserRepository } from "@/src/infrastructure/PrismaUserRepository";
import { PrismaClient } from "@prisma/client";


const userRepository = new PrismaUserRepository(new PrismaClient());
const hasherRepository = new BcryptHasherRepository();

export const serviceContainer = {
    user : {
        createUser : new UserCreate(userRepository, hasherRepository),

    }
}