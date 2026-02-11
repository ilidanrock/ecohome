import { UserCreate } from '@/src/application/User/UserCreate';
import { VerifyTokenCreate } from '@/src/application/VerifyToken/VerifyTokenCreate';
import { BcryptHasherRepository } from '@/src/infrastructure/User/BcryptHasherRepository';

import { PrismaUserRepository } from '@/src/infrastructure/User/PrismaUserRepository';
import { PrismaVerifyTokenRepository } from '@/src/infrastructure/VerifyToken/PrismaVerifyTokenRepository';
import { GmailRepository } from '@/src/infrastructure/VerifyToken/GmailRepository';
import { NanoIdRepository } from '@/src/infrastructure/VerifyToken/NanoIdRepository';
import {
  VerifyTokenDelete,
  VerifyUserEmail,
} from '@/src/application/VerifyToken/VerifyTokenDelete';
import { UserLogin } from '@/src/application/User/UserLogin';
import { UserFind } from '@/src/application/User/UserFind';
import { AccountOAuthSignIn } from '@/src/application/Account/AccountOAuthSignIn';
import { PrismaAccountsRepository } from '@/src/infrastructure/Accounts/PrismaAccountsRepository';
import { GetConsumptionData } from '@/src/application/Consumption/GetConsumptionData';
import { GetConsumptionById } from '@/src/application/Consumption/GetConsumptionById';
import { ExtractMeterReading } from '@/src/application/Consumption/ExtractMeterReading';
import { UpdateMeterReading } from '@/src/application/Consumption/UpdateMeterReading';
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
import { GetUserInvoices } from '@/src/application/Invoice/GetUserInvoices';
import { ListElectricityBillsForAdmin } from '@/src/application/ElectricityBill/ListElectricityBillsForAdmin';
import { ListWaterBillsForAdmin } from '@/src/application/WaterBill/ListWaterBillsForAdmin';
import { PrismaTransactionManager } from '@/src/infrastructure/Shared/PrismaTransactionManager';
import { PrismaElectricityBillRepository } from '@/src/infrastructure/ElectricityBill/PrismaElectricityBillRepository';
import { PrismaServiceChargesRepository } from '@/src/infrastructure/ServiceCharges/PrismaServiceChargesRepository';
import { PrismaWaterBillRepository } from '@/src/infrastructure/WaterBill/PrismaWaterBillRepository';
import { PrismaWaterServiceChargesRepository } from '@/src/infrastructure/WaterServiceCharges/PrismaWaterServiceChargesRepository';
import { PrismaPropertyRepository } from '@/src/infrastructure/Property/PrismaPropertyRepository';
import { CreateInvoicesForProperty } from '@/src/application/Invoice/CreateInvoicesForProperty';
import { prisma } from '@/prisma';
import { validateEnv } from '@/lib/env-validation';
import { logger } from '@/lib/logger';

// Validate environment variables on server initialization
// Only run in server-side code (not in client bundles)
if (typeof window === 'undefined') {
  try {
    validateEnv();
  } catch (error) {
    // Log error but don't crash - let the application start
    // Individual features will fail gracefully if env vars are missing
    logger.error('Environment validation failed during ServiceContainer initialization', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

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
const transactionManager = new PrismaTransactionManager(prisma);
const electricityBillRepository = new PrismaElectricityBillRepository(prisma);
const serviceChargesRepository = new PrismaServiceChargesRepository(prisma);
const waterBillRepository = new PrismaWaterBillRepository(prisma);
const waterServiceChargesRepository = new PrismaWaterServiceChargesRepository(prisma);
const propertyRepository = new PrismaPropertyRepository(prisma);

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
    verifyUserEmail: new VerifyUserEmail(verifyTokenRepository, userRepository),
  },
  account: {
    accountOAuthSignIn: new AccountOAuthSignIn(accountRepository, userRepository),
  },
  consumption: {
    getData: new GetConsumptionData(consumptionRepository),
    getById: new GetConsumptionById(consumptionRepository),
    extractMeterReading: new ExtractMeterReading(consumptionRepository),
    updateMeterReading: new UpdateMeterReading(consumptionRepository),
  },
  rental: {
    getRentalById: new GetRentalById(rentalRepository),
  },
  invoice: {
    getInvoiceById: new GetInvoiceById(invoiceRepository),
    getUserInvoices: new GetUserInvoices(rentalRepository, invoiceRepository),
    createInvoicesForProperty: new CreateInvoicesForProperty(
      electricityBillRepository,
      serviceChargesRepository,
      rentalRepository,
      consumptionRepository,
      invoiceRepository,
      propertyRepository,
      transactionManager
    ),
  },
  electricityBill: {
    repository: electricityBillRepository,
    listForAdmin: new ListElectricityBillsForAdmin(propertyRepository, electricityBillRepository),
  },
  serviceCharges: {
    repository: serviceChargesRepository,
  },
  waterBill: {
    repository: waterBillRepository,
    listForAdmin: new ListWaterBillsForAdmin(propertyRepository, waterBillRepository),
  },
  waterServiceCharges: {
    repository: waterServiceChargesRepository,
  },
  property: {
    repository: propertyRepository,
  },
  transactionManager,
  payment: {
    createRentalPayment: new CreateRentalPayment(paymentRepository, rentalRepository),
    createServicePayment: new CreateServicePayment(
      paymentRepository,
      invoiceRepository,
      transactionManager
    ),
    getPaymentsByRental: new GetPaymentsByRental(paymentRepository),
    getPaymentsByInvoice: new GetPaymentsByInvoice(paymentRepository),
  },
};
