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
    const electricityBill = await this.prisma.electricityBill.findUnique({
      where: { id },
    });

    return electricityBill ? this.mapToDomain(electricityBill) : null;
  }

  /**
   * Find electricity bills by property ID
   *
   * @param propertyId - The property ID
   * @returns Array of ElectricityBill entities
   */
  async findByPropertyId(propertyId: string): Promise<ElectricityBill[]> {
    const electricityBills = await this.prisma.electricityBill.findMany({
      where: { propertyId },
      orderBy: { periodStart: 'desc' },
    });

    return electricityBills.map((bill) => this.mapToDomain(bill));
  }

  /**
   * Find electricity bill by property and period
   *
   * @param propertyId - The property ID
   * @param periodStart - Start of the period
   * @param periodEnd - End of the period
   * @returns ElectricityBill entity or null if not found
   */
  async findByPropertyAndPeriod(
    propertyId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<ElectricityBill | null> {
    const electricityBill = await this.prisma.electricityBill.findFirst({
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

    return electricityBill ? this.mapToDomain(electricityBill) : null;
  }

  /**
   * Create new electricity bill
   *
   * @param electricityBill - The electricity bill entity to create
   * @returns The created ElectricityBill entity
   */
  async create(electricityBill: ElectricityBill): Promise<ElectricityBill> {
    const created = await this.prisma.electricityBill.create({
      data: {
        propertyId: electricityBill.propertyId,
        periodStart: electricityBill.periodStart,
        periodEnd: electricityBill.periodEnd,
        totalKWh: electricityBill.totalKWh,
        totalCost: electricityBill.totalCost,
        fileUrl: electricityBill.fileUrl,
      },
    });

    return this.mapToDomain(created);
  }

  /**
   * Update existing electricity bill
   *
   * @param electricityBill - The electricity bill entity to update
   * @returns The updated ElectricityBill entity
   */
  async update(electricityBill: ElectricityBill): Promise<ElectricityBill> {
    const updated = await this.prisma.electricityBill.update({
      where: { id: electricityBill.id },
      data: {
        periodStart: electricityBill.periodStart,
        periodEnd: electricityBill.periodEnd,
        totalKWh: electricityBill.totalKWh,
        totalCost: electricityBill.totalCost,
        fileUrl: electricityBill.fileUrl,
      },
    });

    return this.mapToDomain(updated);
  }

  /**
   * Delete electricity bill by ID
   *
   * @param id - The electricity bill ID
   */
  async delete(id: string): Promise<void> {
    await this.prisma.electricityBill.delete({
      where: { id },
    });
  }

  /**
   * Map Prisma ElectricityBill model to domain ElectricityBill entity
   *
   * @param prismaElectricityBill - The Prisma ElectricityBill model
   * @returns The domain ElectricityBill entity
   */
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
      prismaElectricityBill.id
    );
  }
}

