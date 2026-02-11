import {
  PrismaClient,
  WaterServiceCharges as PrismaWaterServiceCharges,
} from '@prisma/client';
import { IWaterServiceChargesRepository } from '@/src/domain/WaterServiceCharges/IWaterServiceChargesRepository';
import { WaterServiceCharges } from '@/src/domain/WaterServiceCharges/WaterServiceCharges';

export class PrismaWaterServiceChargesRepository
  implements IWaterServiceChargesRepository
{
  constructor(private prisma: PrismaClient) {}

  /**
   * Find service charges by water bill ID
   *
   * @param waterBillId - The water bill ID
   * @returns WaterServiceCharges entity or null if not found
   */
  async findByWaterBillId(waterBillId: string): Promise<WaterServiceCharges | null> {
    const serviceCharges = await this.prisma.waterServiceCharges.findUnique({
      where: { waterBillId },
    });

    return serviceCharges ? this.mapToDomain(serviceCharges) : null;
  }

  /**
   * Create new water service charges
   *
   * @param waterServiceCharges - The water service charges entity to create
   * @returns The created WaterServiceCharges entity
   */
  async create(
    waterServiceCharges: WaterServiceCharges
  ): Promise<WaterServiceCharges> {
    const created = await this.prisma.waterServiceCharges.create({
      data: {
        waterBillId: waterServiceCharges.waterBillId,
        fixedCharge: waterServiceCharges.fixedCharge,
        sewerageCharge: waterServiceCharges.sewerageCharge,
        lateFee: waterServiceCharges.lateFee,
        previousMonthRounding: waterServiceCharges.previousMonthRounding,
        currentMonthRounding: waterServiceCharges.currentMonthRounding,
      },
    });

    return this.mapToDomain(created);
  }

  /**
   * Update existing water service charges
   *
   * @param waterServiceCharges - The water service charges entity to update
   * @returns The updated WaterServiceCharges entity
   */
  async update(
    waterServiceCharges: WaterServiceCharges
  ): Promise<WaterServiceCharges> {
    const updated = await this.prisma.waterServiceCharges.update({
      where: { id: waterServiceCharges.id },
      data: {
        fixedCharge: waterServiceCharges.fixedCharge,
        sewerageCharge: waterServiceCharges.sewerageCharge,
        lateFee: waterServiceCharges.lateFee,
        previousMonthRounding: waterServiceCharges.previousMonthRounding,
        currentMonthRounding: waterServiceCharges.currentMonthRounding,
      },
    });

    return this.mapToDomain(updated);
  }

  /**
   * Delete water service charges by water bill ID
   *
   * @param waterBillId - The water bill ID
   */
  async deleteByWaterBillId(waterBillId: string): Promise<void> {
    await this.prisma.waterServiceCharges.delete({
      where: { waterBillId },
    });
  }

  /**
   * Map Prisma WaterServiceCharges model to domain WaterServiceCharges entity
   *
   * @param prismaWaterServiceCharges - The Prisma WaterServiceCharges model
   * @returns The domain WaterServiceCharges entity
   */
  private mapToDomain(
    prismaWaterServiceCharges: PrismaWaterServiceCharges
  ): WaterServiceCharges {
    return new WaterServiceCharges(
      prismaWaterServiceCharges.waterBillId,
      Number(prismaWaterServiceCharges.fixedCharge),
      Number(prismaWaterServiceCharges.sewerageCharge),
      Number(prismaWaterServiceCharges.lateFee),
      Number(prismaWaterServiceCharges.previousMonthRounding),
      Number(prismaWaterServiceCharges.currentMonthRounding),
      prismaWaterServiceCharges.createdAt,
      prismaWaterServiceCharges.updatedAt,
      prismaWaterServiceCharges.id
    );
  }
}
