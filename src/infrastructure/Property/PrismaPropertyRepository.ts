import { PrismaClient, Property as PrismaProperty } from '@prisma/client';
import { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import { Property } from '@/src/domain/Property/Property';
import { User } from '@/src/domain/User/User';

export class PrismaPropertyRepository implements IPropertyRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find a property by ID
   *
   * @param id - The property ID
   * @returns The property entity or null if not found
   */
  async findById(id: string): Promise<Property | null> {
    const property = await this.prisma.property.findUnique({
      where: { id },
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
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: { administrators: true },
    });

    if (!property) {
      return null;
    }

    return {
      property: this.mapToDomain(property),
      administrators: property.administrators.map((admin) => this.mapUserToDomain(admin)),
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
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: { administrators: true },
    });

    if (!property) {
      return false;
    }

    return property.administrators.some((admin) => admin.id === userId);
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
      prismaProperty.id
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
