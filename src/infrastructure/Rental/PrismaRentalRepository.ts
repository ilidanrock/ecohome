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
    const rental = await this.prisma.rental.findUnique({
      where: { id },
    });

    return rental ? this.mapToDomain(rental) : null;
  }

  async findByUserId(userId: string): Promise<Rental[]> {
    const rentals = await this.prisma.rental.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });
    return rentals.map((r) => this.mapToDomain(r));
  }

  async findActiveByPropertyId(propertyId: string, date: Date): Promise<Rental[]> {
    const rentals = await this.prisma.rental.findMany({
      where: {
        propertyId,
        startDate: {
          lte: date,
        },
        OR: [{ endDate: null }, { endDate: { gte: date } }],
      },
    });

    return rentals.map((rental) => this.mapToDomain(rental));
  }

  /**
   * Map Prisma Rental model to domain Rental entity
   *
   * @param prismaRental - The Prisma Rental model
   * @returns The domain Rental entity
   */
  private mapToDomain(prismaRental: PrismaRental): Rental {
    return new Rental(
      prismaRental.userId,
      prismaRental.propertyId,
      prismaRental.startDate,
      prismaRental.endDate,
      prismaRental.createdAt,
      prismaRental.updatedAt,
      prismaRental.id
    );
  }
}
