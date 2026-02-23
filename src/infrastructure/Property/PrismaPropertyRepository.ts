import { PrismaClient, Property as PrismaProperty } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import { Property } from '@/src/domain/Property/Property';
import { User } from '@/src/domain/User/User';

/** Extracts the type expected by Property.where.administrators.some from the generated client */
type PropertyAdministratorsSomeWhere = NonNullable<
  NonNullable<
    NonNullable<
      Parameters<PrismaClient['property']['findMany']>[0]
    >['where']
  >['administrators']
>['some'];

/** Extracts the type expected by Property.create.data.administrators from the generated client */
type PropertyAdministratorsCreateNested = NonNullable<
  NonNullable<
    NonNullable<Parameters<PrismaClient['property']['create']>[0]>['data']
  >['administrators']
>;

/** Shape expected from Prisma when including administrators.user (workaround for generated include typings) */
type PropertyWithAdminUsers = PrismaProperty & {
  administrators: Array<{
    userId: string;
    user: {
      id: string;
      name: string | null;
      surname: string | null;
      email: string;
      role: string;
      emailVerified: Date | null;
      image: string | null;
      password: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
  }>;
};

export class PrismaPropertyRepository implements IPropertyRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find a property by ID
   *
   * @param id - The property ID
   * @returns The property entity or null if not found
   */
  async findById(id: string): Promise<Property | null> {
    const property = await this.prisma.property.findFirst({
      where: { id, deletedAt: null },
    });

    return property ? this.mapToDomain(property) : null;
  }

  /**
   * Find a property by ID with administrators
   *
   * @param id - The property ID
   * @returns The property entity with administrators or null if not found
   */
  async findByIdWithAdministrators(
    id: string
  ): Promise<{ property: Property; administrators: User[] } | null> {
    const row = await this.prisma.property.findFirst({
      where: { id, deletedAt: null },
      include: {
        administrators: {
          include: { user: true },
        } as unknown as Prisma.Property$administratorsArgs,
      },
    });

    if (!row) {
      return null;
    }

    const property = row as unknown as PropertyWithAdminUsers;
    return {
      property: this.mapToDomain(property),
      administrators: property.administrators.map((pa) => this.mapUserToDomain(pa.user)),
    };
  }

  /**
   * Find all properties managed by a user (admin)
   *
   * @param userId - The user ID
   * @returns Array of Property entities
   */
  async findManagedByUserId(userId: string): Promise<Property[]> {
    const properties = await this.prisma.property.findMany({
      where: {
        administrators: {
          some: { userId } as PropertyAdministratorsSomeWhere,
        },
        deletedAt: null,
      },
    });
    return properties.map((p) => this.mapToDomain(p));
  }

  async findManagedByUserIdPaginated(
    userId: string,
    options: { page: number; limit: number; search?: string }
  ): Promise<{ properties: Property[]; total: number }> {
    const { page, limit, search } = options;
    const baseWhere = {
      administrators: {
        some: { userId } as PropertyAdministratorsSomeWhere,
      },
      deletedAt: null,
    };
    const where = search?.trim()
      ? {
          AND: [
            baseWhere,
            {
              OR: [
                { name: { contains: search.trim(), mode: 'insensitive' as const } },
                { address: { contains: search.trim(), mode: 'insensitive' as const } },
              ],
            },
          ],
        }
      : baseWhere;

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      properties: properties.map((p) => this.mapToDomain(p)),
      total,
    };
  }

  /**
   * Check if a user is an administrator of a property
   *
   * @param propertyId - The property ID
   * @param userId - The user ID
   * @returns True if the user is an administrator, false otherwise
   */
  async isUserAdministrator(propertyId: string, userId: string): Promise<boolean> {
    const row = await this.prisma.property.findFirst({
      where: { id: propertyId, deletedAt: null },
      include: {
        administrators: {
          include: { user: true },
        } as unknown as Prisma.Property$administratorsArgs,
      },
    });

    if (!row) {
      return false;
    }

    const admins = (row as unknown as PropertyWithAdminUsers).administrators;
    return admins.some((pa) => pa.userId === userId);
  }

  /**
   * Create a new property and assign the user as administrator
   */
  async create(property: Property, administratorUserId: string): Promise<Property> {
    const created = await this.prisma.property.create({
      data: {
        name: property.getName(),
        address: property.getAddress(),
        administrators: {
          create: [{ userId: administratorUserId }],
        } as unknown as PropertyAdministratorsCreateNested,
        createdById: administratorUserId,
        updatedById: administratorUserId,
      },
    });
    return this.mapToDomain(created);
  }

  async update(
    id: string,
    name: string,
    address: string,
    userId: string
  ): Promise<Property | null> {
    const existing = await this.prisma.property.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) return null;
    const updated = await this.prisma.property.update({
      where: { id },
      data: { name, address, updatedById: userId },
    });
    return this.mapToDomain(updated);
  }

  async softDelete(id: string, userId: string): Promise<void> {
    await this.prisma.property.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: userId },
    });
  }

  /**
   * Map Prisma Property model to domain Property entity
   *
   * @param prismaProperty - The Prisma Property model
   * @returns The domain Property entity
   */
  private mapToDomain(prismaProperty: PrismaProperty): Property {
    return new Property(
      prismaProperty.name,
      prismaProperty.address,
      prismaProperty.createdAt,
      prismaProperty.updatedAt,
      prismaProperty.id,
      prismaProperty.deletedAt ?? undefined,
      prismaProperty.createdById ?? undefined,
      prismaProperty.updatedById ?? undefined,
      prismaProperty.deletedById ?? undefined
    );
  }

  /**
   * Map Prisma User model to domain User entity
   *
   * @param prismaUser - The Prisma User model
   * @returns The domain User entity
   */
  private mapUserToDomain(prismaUser: {
    id: string;
    name: string | null;
    surname: string | null;
    email: string;
    role: string;
    emailVerified: Date | null;
    image: string | null;
    password: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      prismaUser.name || '',
      prismaUser.surname || '',
      prismaUser.password || null,
      prismaUser.email,
      prismaUser.emailVerified || null,
      prismaUser.image || null,
      prismaUser.role as 'USER' | 'ADMIN' | 'NULL',
      prismaUser.createdAt,
      prismaUser.updatedAt,
      prismaUser.id
    );
  }
}
