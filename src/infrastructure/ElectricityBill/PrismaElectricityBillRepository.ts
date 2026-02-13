import { PrismaClient, ElectricityBill as PrismaElectricityBill } from '@prisma/client';
import { IElectricityBillRepository } from '@/src/domain/ElectricityBill/IElectricityBillRepository';
import { ElectricityBill } from '@/src/domain/ElectricityBill/ElectricityBill';

export class PrismaElectricityBillRepository implements IElectricityBillRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find electricity bill by ID
   *
   * @param id - The electricity bill ID
   * @returns ElectricityBill entity or null if not found
   */
  async findById(id: string): Promise<ElectricityBill | null> {
    const electricityBill = await this.prisma.electricityBill.findFirst({
      where: { id, deletedAt: null },
    });

    return electricityBill ? this.mapToDomain(electricityBill) : null;
  }

  async findByPropertyId(propertyId: string): Promise<ElectricityBill[]> {
    const electricityBills = await this.prisma.electricityBill.findMany({
      where: { propertyId, deletedAt: null },
      orderBy: { periodStart: 'desc' },
    });

    return electricityBills.map((bill) => this.mapToDomain(bill));
  }

  async findManyByPropertyIds(propertyIds: string[]): Promise<ElectricityBill[]> {
    if (propertyIds.length === 0) return [];
    const electricityBills = await this.prisma.electricityBill.findMany({
      where: { propertyId: { in: propertyIds }, deletedAt: null },
      orderBy: { periodStart: 'desc' },
    });
    return electricityBills.map((bill) => this.mapToDomain(bill));
  }

  async findByPropertyAndPeriod(
    propertyId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<ElectricityBill | null> {
    const electricityBill = await this.prisma.electricityBill.findFirst({
      where: {
        propertyId,
        deletedAt: null,
        periodStart: { lte: periodEnd },
        periodEnd: { gte: periodStart },
      },
    });

    return electricityBill ? this.mapToDomain(electricityBill) : null;
  }

  async create(electricityBill: ElectricityBill, userId: string): Promise<ElectricityBill> {
    const created = await this.prisma.electricityBill.create({
      data: {
        propertyId: electricityBill.propertyId,
        periodStart: electricityBill.periodStart,
        periodEnd: electricityBill.periodEnd,
        totalKWh: electricityBill.totalKWh,
        totalCost: electricityBill.totalCost,
        fileUrl: electricityBill.fileUrl,
        createdById: userId,
        updatedById: userId,
      },
    });

    return this.mapToDomain(created);
  }

  async update(electricityBill: ElectricityBill, userId: string): Promise<ElectricityBill> {
    const updated = await this.prisma.electricityBill.update({
      where: { id: electricityBill.id },
      data: {
        periodStart: electricityBill.periodStart,
        periodEnd: electricityBill.periodEnd,
        totalKWh: electricityBill.totalKWh,
        totalCost: electricityBill.totalCost,
        fileUrl: electricityBill.fileUrl,
        updatedById: userId,
      },
    });

    return this.mapToDomain(updated);
  }

  async softDelete(id: string, userId: string): Promise<void> {
    await this.prisma.electricityBill.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: userId },
    });
  }

  private mapToDomain(prismaElectricityBill: PrismaElectricityBill): ElectricityBill {
    return new ElectricityBill(
      prismaElectricityBill.propertyId,
      prismaElectricityBill.periodStart,
      prismaElectricityBill.periodEnd,
      Number(prismaElectricityBill.totalKWh),
      Number(prismaElectricityBill.totalCost),
      prismaElectricityBill.fileUrl,
      prismaElectricityBill.createdAt,
      prismaElectricityBill.updatedAt,
      prismaElectricityBill.id,
      prismaElectricityBill.deletedAt ?? undefined,
      prismaElectricityBill.createdById ?? undefined,
      prismaElectricityBill.updatedById ?? undefined,
      prismaElectricityBill.deletedById ?? undefined
    );
  }
}
