import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const [
    user,
    account,
    verificationToken,
    property,
    rental,
    consumption,
    electricityBill,
    serviceCharges,
    waterBill,
    waterServiceCharges,
    invoice,
    payment,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.account.count(),
    prisma.verificationToken.count(),
    prisma.property.count(),
    prisma.rental.count(),
    prisma.consumption.count(),
    prisma.electricityBill.count(),
    prisma.serviceCharges.count(),
    prisma.waterBill.count(),
    prisma.waterServiceCharges.count(),
    prisma.invoice.count(),
    prisma.payment.count(),
  ]);

  console.log('DB counts (public tables):');
  console.log('  User:', user);
  console.log('  Account:', account);
  console.log('  VerificationToken:', verificationToken);
  console.log('  Property:', property);
  console.log('  Rental:', rental);
  console.log('  Consumption:', consumption);
  console.log('  ElectricityBill:', electricityBill);
  console.log('  ServiceCharges:', serviceCharges);
  console.log('  WaterBill:', waterBill);
  console.log('  WaterServiceCharges:', waterServiceCharges);
  console.log('  Invoice:', invoice);
  console.log('  Payment:', payment);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
