import { PrismaClient, Rental as PrismaRental } from '@prisma/client';
import { IRentalRepository } from '@/src/domain/Rental/IRentalRepository';
import { Rental } from '@/src/domain/Rental/Rental';

export class PrismaRentalRepository implements IRentalRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find a rental by ID
   *
   * @param id - The rental ID
   * @returns The rental entity or null if not found
   */
  async findById(id: string): Promise<Rental | null> {
    const rental = await this.prisma.rental.findFirst({
      where: { id, deletedAt: null },
    });

    return rental ? this.mapToDomain(rental) : null;
  }

  async findByUserId(userId: string): Promise<Rental[]> {
    const rentals = await this.prisma.rental.findMany({
      where: { userId, deletedAt: null },
      orderBy: { startDate: 'desc' },
    });
    return rentals.map((r) => this.mapToDomain(r));
  }

  async findActiveByPropertyId(propertyId: string, date: Date): Promise<Rental[]> {
    const rentals = await this.prisma.rental.findMany({
      where: {
        propertyId,
        deletedAt: null,
        startDate: { lte: date },
        OR: [{ endDate: null }, { endDate: { gte: date } }],
      },
    });

    return rentals.map((rental) => this.mapToDomain(rental));
  }

  async findByUserIdAndPropertyId(userId: string, propertyId: string): Promise<Rental | null> {
    const rental = await this.prisma.rental.findFirst({
      where: { userId, propertyId, deletedAt: null },
    });
    return rental ? this.mapToDomain(rental) : null;
  }

  async findByUserIdAndPropertyIdIncludingDeleted(
    userId: string,
    propertyId: string
  ): Promise<Rental | null> {
    const rental = await this.prisma.rental.findFirst({
      where: { userId, propertyId },
    });
    return rental ? this.mapToDomain(rental) : null;
  }

  async restore(
    id: string,
    data: { startDate: Date; endDate?: Date | null; updatedById: string }
  ): Promise<Rental> {
    const updated = await this.prisma.rental.update({
      where: { id },
      data: {
        startDate: data.startDate,
        endDate: data.endDate ?? null,
        updatedById: data.updatedById,
        deletedAt: null,
        deletedById: null,
      },
    });
    return this.mapToDomain(updated);
  }

  async findNonDeletedByPropertyId(propertyId: string): Promise<Rental[]> {
    const rentals = await this.prisma.rental.findMany({
      where: { propertyId, deletedAt: null },
      orderBy: { startDate: 'desc' },
    });
    return rentals.map((r) => this.mapToDomain(r));
  }

  async create(rental: Rental): Promise<Rental> {
    const created = await this.prisma.rental.create({
      data: {
        userId: rental.userId,
        propertyId: rental.propertyId,
        startDate: rental.startDate,
        endDate: rental.endDate,
        createdById: rental.createdById ?? undefined,
      },
    });
    return this.mapToDomain(created);
  }

  async update(
    id: string,
    data: { startDate?: Date; endDate?: Date | null; updatedById: string }
  ): Promise<Rental> {
    const updated = await this.prisma.rental.update({
      where: { id },
      data: {
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        updatedById: data.updatedById,
      },
    });
    return this.mapToDomain(updated);
  }

  async softDelete(id: string, userId: string): Promise<void> {
    await this.prisma.rental.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: userId },
    });
  }

  async softDeleteByPropertyId(propertyId: string, userId: string): Promise<void> {
    await this.prisma.rental.updateMany({
      where: { propertyId, deletedAt: null },
      data: { deletedAt: new Date(), deletedById: userId },
    });
  }

  /**
   * Map Prisma Rental model to domain Rental entity
   */
  private mapToDomain(prismaRental: PrismaRental): Rental {
    return new Rental(
      prismaRental.userId,
      prismaRental.propertyId,
      prismaRental.startDate,
      prismaRental.endDate,
      prismaRental.createdAt,
      prismaRental.updatedAt,
      prismaRental.id,
      prismaRental.deletedAt ?? undefined,
      prismaRental.createdById ?? undefined,
      prismaRental.updatedById ?? undefined,
      prismaRental.deletedById ?? undefined
    );
  }
}
