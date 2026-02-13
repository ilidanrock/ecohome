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
    const waterBill = await this.prisma.waterBill.findFirst({
      where: { id, deletedAt: null },
    });

    return waterBill ? this.mapToDomain(waterBill) : null;
  }

  async findByPropertyId(propertyId: string): Promise<WaterBill[]> {
    const waterBills = await this.prisma.waterBill.findMany({
      where: { propertyId, deletedAt: null },
      orderBy: { periodStart: 'desc' },
    });

    return waterBills.map((bill) => this.mapToDomain(bill));
  }

  async findManyByPropertyIds(propertyIds: string[]): Promise<WaterBill[]> {
    if (propertyIds.length === 0) return [];
    const waterBills = await this.prisma.waterBill.findMany({
      where: { propertyId: { in: propertyIds }, deletedAt: null },
      orderBy: { periodStart: 'desc' },
    });
    return waterBills.map((bill) => this.mapToDomain(bill));
  }

  async findByPropertyAndPeriod(
    propertyId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<WaterBill | null> {
    const waterBill = await this.prisma.waterBill.findFirst({
      where: {
        propertyId,
        deletedAt: null,
        periodStart: { lte: periodEnd },
        periodEnd: { gte: periodStart },
      },
    });

    return waterBill ? this.mapToDomain(waterBill) : null;
  }

  async create(waterBill: WaterBill, userId: string): Promise<WaterBill> {
    const created = await this.prisma.waterBill.create({
      data: {
        propertyId: waterBill.propertyId,
        periodStart: waterBill.periodStart,
        periodEnd: waterBill.periodEnd,
        totalConsumption: waterBill.totalConsumption,
        totalCost: waterBill.totalCost,
        fileUrl: waterBill.fileUrl,
        createdById: userId,
        updatedById: userId,
      },
    });

    return this.mapToDomain(created);
  }

  async update(waterBill: WaterBill, userId: string): Promise<WaterBill> {
    const updated = await this.prisma.waterBill.update({
      where: { id: waterBill.id },
      data: {
        periodStart: waterBill.periodStart,
        periodEnd: waterBill.periodEnd,
        totalConsumption: waterBill.totalConsumption,
        totalCost: waterBill.totalCost,
        fileUrl: waterBill.fileUrl,
        updatedById: userId,
      },
    });

    return this.mapToDomain(updated);
  }

  async softDelete(id: string, userId: string): Promise<void> {
    await this.prisma.waterBill.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: userId },
    });
  }

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
      prismaWaterBill.id,
      prismaWaterBill.deletedAt ?? undefined,
      prismaWaterBill.createdById ?? undefined,
      prismaWaterBill.updatedById ?? undefined,
      prismaWaterBill.deletedById ?? undefined
    );
  }
}
