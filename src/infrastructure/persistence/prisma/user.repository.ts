
import { prisma } from '@/prisma';
import { UserRepositoryPort } from '@/src/core/domain/user/ports/user.repository.port';
import { User } from '@/src/core/domain/user/entities/user.entity';

export class PrismaUserRepository implements UserRepositoryPort {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? User.createUserObject(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? User.createUserObject(user) : null;
  }

  async save(user: User): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // 1. Create the user
      const createdUser = await tx.user.create({
        data: {
          name: user.name,
          surname: user.surname,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          password: user.password, // This should be hashed before reaching here
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });

      // 2. Create the credentials account
      await tx.account.create({
        data: {
          userId: createdUser.id,
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: createdUser.id,
        },
      });
    });
  }

  async update(user: User): Promise<void> {
    await prisma.user.update({
      where: { email: user.email },
      data: {
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        role: user.role,
        updatedAt: new Date(),
      },
    });
  }

  async delete(email: string): Promise<void> {
    await prisma.user.delete({ where: { email } });
  }
}
