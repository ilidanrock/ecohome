import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const E2E_USER_EMAIL = process.env.E2E_TEST_USER_EMAIL || 'e2e@test.com';
const E2E_USER_PASSWORD = process.env.E2E_TEST_USER_PASSWORD || 'Test1234!';

async function main() {
  const hashedPassword = await bcrypt.hash(E2E_USER_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: E2E_USER_EMAIL },
    update: {},
    create: {
      email: E2E_USER_EMAIL,
      name: 'E2E',
      surname: 'Test',
      password: hashedPassword,
      role: 'USER',
    },
  });

  console.log(`Seed: E2E user ${E2E_USER_EMAIL} ready.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
