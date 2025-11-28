import { PrismaClient, Consumption as PrismaConsumption } from '@prisma/client';
import { IConsumptionRepository } from '@/src/domain/Consumption/IConsumptionRepository';
import { Consumption } from '@/src/domain/Consumption/Consumption';

export class PrismaConsumptionRepository implements IConsumptionRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find all consumptions for a specific user
   *
   * Performance optimization: Limited to 100 most recent records to prevent
   * loading excessive data. This is sufficient for trend calculation which
   * only requires the latest 2-3 records. If pagination is needed in the future,
   * consider adding skip/take parameters.
   *
   * @param userId - The user ID
   * @returns Array of Consumption entities (max 100, most recent first)
   */
  async findByUserId(userId: string): Promise<Consumption[]> {
    const consumptions = await this.prisma.consumption.findMany({
      where: {
        rental: {
          userId,
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: 100, // Limit to prevent loading excessive data
    });

    return consumptions.map((consumption) => this.mapToDomain(consumption));
  }

  /**
   * Find consumptions for a specific rental
   *
   * Performance optimization: Limited to 100 most recent records for consistency
   * with findByUserId. Adjust limit based on business requirements if needed.
   *
   * @param rentalId - The rental ID
   * @returns Array of Consumption entities (max 100, most recent first)
   */
  async findByRentalId(rentalId: string): Promise<Consumption[]> {
    const consumptions = await this.prisma.consumption.findMany({
      where: {
        rentalId,
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: 100, // Limit to prevent loading excessive data
    });

    return consumptions.map((consumption) => this.mapToDomain(consumption));
  }

  async findByRentalMonthYear(
    rentalId: string,
    month: number,
    year: number
  ): Promise<Consumption | null> {
    const consumption = await this.prisma.consumption.findUnique({
      where: {
        rentalId_month_year: {
          rentalId,
          month,
          year,
        },
      },
    });

    return consumption ? this.mapToDomain(consumption) : null;
  }

  async findLatestByUserId(userId: string): Promise<Consumption | null> {
    const consumption = await this.prisma.consumption.findFirst({
      where: {
        rental: {
          userId,
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { createdAt: 'desc' }],
    });

    return consumption ? this.mapToDomain(consumption) : null;
  }

  private mapToDomain(prismaConsumption: PrismaConsumption): Consumption {
    return new Consumption(
      prismaConsumption.rentalId,
      prismaConsumption.month,
      prismaConsumption.year,
      Number(prismaConsumption.energyReading), // Convert Decimal to number
      prismaConsumption.meterImageUrl,
      prismaConsumption.extractedAt,
      prismaConsumption.createdAt,
      prismaConsumption.updatedAt,
      prismaConsumption.id,
      prismaConsumption.previousReading ? Number(prismaConsumption.previousReading) : null
    );
  }
}
