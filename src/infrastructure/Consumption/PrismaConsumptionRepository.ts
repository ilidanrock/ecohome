import { PrismaClient, Consumption as PrismaConsumption } from '@prisma/client';
import { IConsumptionRepository } from '@/src/domain/Consumption/IConsumptionRepository';
import { Consumption } from '@/src/domain/Consumption/Consumption';

export class PrismaConsumptionRepository implements IConsumptionRepository {
  constructor(private prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<Consumption[]> {
    const consumptions = await this.prisma.consumption.findMany({
      where: {
        rental: {
          userId,
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return consumptions.map((consumption) => this.mapToDomain(consumption));
  }

  async findByRentalId(rentalId: string): Promise<Consumption[]> {
    const consumptions = await this.prisma.consumption.findMany({
      where: {
        rentalId,
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return consumptions.map((consumption) => this.mapToDomain(consumption));
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
      prismaConsumption.id
    );
  }
}
