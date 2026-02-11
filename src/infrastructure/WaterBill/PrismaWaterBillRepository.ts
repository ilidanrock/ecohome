import { PrismaClient, WaterBill as PrismaWaterBill } from '@prisma/client';
import { IWaterBillRepository } from '@/src/domain/WaterBill/IWaterBillRepository';
import { WaterBill } from '@/src/domain/WaterBill/WaterBill';

export class PrismaWaterBillRepository implements IWaterBillRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find water bill by ID
   *
   * @param id - The water bill ID
   * @returns WaterBill entity or null if not found
   */
  async findById(id: string): Promise<WaterBill | null> {
    const waterBill = await this.prisma.waterBill.findUnique({
      where: { id },
    });

    return waterBill ? this.mapToDomain(waterBill) : null;
  }

  /**
   * Find water bills by property ID
   *
   * @param propertyId - The property ID
   * @returns Array of WaterBill entities
   */
  async findByPropertyId(propertyId: string): Promise<WaterBill[]> {
    const waterBills = await this.prisma.waterBill.findMany({
      where: { propertyId },
      orderBy: { periodStart: 'desc' },
    });

    return waterBills.map((bill) => this.mapToDomain(bill));
  }

  /**
   * Find water bill by property and period
   *
   * @param propertyId - The property ID
   * @param periodStart - Start of the period
   * @param periodEnd - End of the period
   * @returns WaterBill entity or null if not found
   */
  async findByPropertyAndPeriod(
    propertyId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<WaterBill | null> {
    const waterBill = await this.prisma.waterBill.findFirst({
      where: {
        propertyId,
        periodStart: {
          lte: periodEnd,
        },
        periodEnd: {
          gte: periodStart,
        },
      },
    });

    return waterBill ? this.mapToDomain(waterBill) : null;
  }

  /**
   * Create new water bill
   *
   * @param waterBill - The water bill entity to create
   * @returns The created WaterBill entity
   */
  async create(waterBill: WaterBill): Promise<WaterBill> {
    const created = await this.prisma.waterBill.create({
      data: {
        propertyId: waterBill.propertyId,
        periodStart: waterBill.periodStart,
        periodEnd: waterBill.periodEnd,
        totalConsumption: waterBill.totalConsumption,
        totalCost: waterBill.totalCost,
        fileUrl: waterBill.fileUrl,
      },
    });

    return this.mapToDomain(created);
  }

  /**
   * Update existing water bill
   *
   * @param waterBill - The water bill entity to update
   * @returns The updated WaterBill entity
   */
  async update(waterBill: WaterBill): Promise<WaterBill> {
    const updated = await this.prisma.waterBill.update({
      where: { id: waterBill.id },
      data: {
        periodStart: waterBill.periodStart,
        periodEnd: waterBill.periodEnd,
        totalConsumption: waterBill.totalConsumption,
        totalCost: waterBill.totalCost,
        fileUrl: waterBill.fileUrl,
      },
    });

    return this.mapToDomain(updated);
  }

  /**
   * Delete water bill by ID
   *
   * @param id - The water bill ID
   */
  async delete(id: string): Promise<void> {
    await this.prisma.waterBill.delete({
      where: { id },
    });
  }

  /**
   * Map Prisma WaterBill model to domain WaterBill entity
   *
   * @param prismaWaterBill - The Prisma WaterBill model
   * @returns The domain WaterBill entity
   */
  private mapToDomain(prismaWaterBill: PrismaWaterBill): WaterBill {
    return new WaterBill(
      prismaWaterBill.propertyId,
      prismaWaterBill.periodStart,
      prismaWaterBill.periodEnd,
      Number(prismaWaterBill.totalConsumption),
      Number(prismaWaterBill.totalCost),
      prismaWaterBill.fileUrl,
      prismaWaterBill.createdAt,
      prismaWaterBill.updatedAt,
      prismaWaterBill.id
    );
  }
}
