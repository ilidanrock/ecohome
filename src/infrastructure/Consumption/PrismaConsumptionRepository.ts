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
        deletedAt: null,
        rental: { userId },
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
      where: { rentalId, deletedAt: null },
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
    const consumption = await this.prisma.consumption.findFirst({
      where: {
        rentalId,
        month,
        year,
        deletedAt: null,
      },
    });

    return consumption ? this.mapToDomain(consumption) : null;
  }

  async findById(id: string): Promise<Consumption | null> {
    const consumption = await this.prisma.consumption.findFirst({
      where: { id, deletedAt: null },
    });

    return consumption ? this.mapToDomain(consumption) : null;
  }

  async findLatestByUserId(userId: string): Promise<Consumption | null> {
    const consumption = await this.prisma.consumption.findFirst({
      where: {
        deletedAt: null,
        rental: { userId },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { createdAt: 'desc' }],
    });

    return consumption ? this.mapToDomain(consumption) : null;
  }

  async update(consumption: Consumption, userId: string): Promise<Consumption> {
    const updated = await this.prisma.consumption.update({
      where: { id: consumption.id },
      data: {
        energyReading: consumption.energyReading,
        previousReading: consumption.previousReading,
        meterImageUrl: consumption.meterImageUrl,
        ocrExtracted: consumption.ocrExtracted,
        ocrConfidence: consumption.ocrConfidence,
        ocrRawText: consumption.ocrRawText,
        extractedAt: consumption.extractedAt,
        updatedById: userId,
      },
    });

    return this.mapToDomain(updated);
  }

  async softDelete(id: string, userId: string): Promise<void> {
    await this.prisma.consumption.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: userId },
    });
  }

  private mapToDomain(prismaConsumption: PrismaConsumption): Consumption {
    return new Consumption(
      prismaConsumption.rentalId,
      prismaConsumption.month,
      prismaConsumption.year,
      Number(prismaConsumption.energyReading),
      prismaConsumption.meterImageUrl,
      prismaConsumption.extractedAt,
      prismaConsumption.createdAt,
      prismaConsumption.updatedAt,
      prismaConsumption.id,
      prismaConsumption.previousReading ? Number(prismaConsumption.previousReading) : null,
      prismaConsumption.ocrExtracted,
      prismaConsumption.ocrConfidence ? Number(prismaConsumption.ocrConfidence) : null,
      prismaConsumption.ocrRawText,
      prismaConsumption.deletedAt ?? undefined,
      prismaConsumption.createdById ?? undefined,
      prismaConsumption.updatedById ?? undefined,
      prismaConsumption.deletedById ?? undefined
    );
  }
}
