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
import { CreateRentalPayment } from '@/src/application/Payment/CreateRentalPayment';
import { CreateServicePayment } from '@/src/application/Payment/CreateServicePayment';
import { GetPaymentsByRental } from '@/src/application/Payment/GetPaymentsByRental';
import { GetPaymentsByInvoice } from '@/src/application/Payment/GetPaymentsByInvoice';
import { PrismaPaymentRepository } from '@/src/infrastructure/Payment/PrismaPaymentRepository';
import { PrismaRentalRepository } from '@/src/infrastructure/Rental/PrismaRentalRepository';
import { PrismaInvoiceRepository } from '@/src/infrastructure/Invoice/PrismaInvoiceRepository';
import { GetRentalById } from '@/src/application/Rental/GetRentalById';
import { GetInvoiceById } from '@/src/application/Invoice/GetInvoiceById';
import { prisma } from '@/prisma';

const userRepository = new PrismaUserRepository(prisma);
const hasherRepository = new BcryptHasherRepository();
const generatorIdRepository = new NanoIdRepository();
const emailRepository = new GmailRepository();
const verifyTokenRepository = new PrismaVerifyTokenRepository(prisma);
const accountRepository = new PrismaAccountsRepository(prisma);
const consumptionRepository = new PrismaConsumptionRepository(prisma);
const paymentRepository = new PrismaPaymentRepository(prisma);
const rentalRepository = new PrismaRentalRepository(prisma);
const invoiceRepository = new PrismaInvoiceRepository(prisma);

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
  rental: {
    getRentalById: new GetRentalById(rentalRepository),
  },
  invoice: {
    getInvoiceById: new GetInvoiceById(invoiceRepository),
  },
  payment: {
    createRentalPayment: new CreateRentalPayment(paymentRepository, rentalRepository),
    createServicePayment: new CreateServicePayment(paymentRepository, invoiceRepository),
    getPaymentsByRental: new GetPaymentsByRental(paymentRepository),
    getPaymentsByInvoice: new GetPaymentsByInvoice(paymentRepository),
  },
};
