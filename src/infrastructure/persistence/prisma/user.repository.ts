
import { prisma } from '@/prisma';
import { UserRepositoryPort } from '@/src/core/domain/user/ports/user.repository.port';
import { User } from '@/src/core/domain/user/entities/user.entity';

export class PrismaUserRepository implements UserRepositoryPort {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? User.fromPrisma(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? User.fromPrisma(user) : null;
  }

  async save(user: User): Promise<void> {
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
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
