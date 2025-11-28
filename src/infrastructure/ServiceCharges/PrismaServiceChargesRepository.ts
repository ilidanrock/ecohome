import { PrismaClient, ServiceCharges as PrismaServiceCharges } from '@prisma/client';
import { IServiceChargesRepository } from '@/src/domain/ServiceCharges/IServiceChargesRepository';
import { ServiceCharges } from '@/src/domain/ServiceCharges/ServiceCharges';

export class PrismaServiceChargesRepository implements IServiceChargesRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find service charges by electricity bill ID
   *
   * @param electricityBillId - The electricity bill ID
   * @returns ServiceCharges entity or null if not found
   */
  async findByElectricityBillId(electricityBillId: string): Promise<ServiceCharges | null> {
    const serviceCharges = await this.prisma.serviceCharges.findUnique({
      where: { electricityBillId },
    });

    return serviceCharges ? this.mapToDomain(serviceCharges) : null;
  }

  /**
   * Create new service charges
   *
   * @param serviceCharges - The service charges entity to create
   * @returns The created ServiceCharges entity
   */
  async create(serviceCharges: ServiceCharges): Promise<ServiceCharges> {
    const created = await this.prisma.serviceCharges.create({
      data: {
        electricityBillId: serviceCharges.electricityBillId,
        maintenanceAndReplacement: serviceCharges.maintenanceAndReplacement,
        fixedCharge: serviceCharges.fixedCharge,
        compensatoryInterest: serviceCharges.compensatoryInterest,
        publicLighting: serviceCharges.publicLighting,
        lawContribution: serviceCharges.lawContribution,
        lateFee: serviceCharges.lateFee,
        previousMonthRounding: serviceCharges.previousMonthRounding,
        currentMonthRounding: serviceCharges.currentMonthRounding,
      },
    });

    return this.mapToDomain(created);
  }

  /**
   * Update existing service charges
   *
   * @param serviceCharges - The service charges entity to update
   * @returns The updated ServiceCharges entity
   */
  async update(serviceCharges: ServiceCharges): Promise<ServiceCharges> {
    const updated = await this.prisma.serviceCharges.update({
      where: { id: serviceCharges.id },
      data: {
        maintenanceAndReplacement: serviceCharges.maintenanceAndReplacement,
        fixedCharge: serviceCharges.fixedCharge,
        compensatoryInterest: serviceCharges.compensatoryInterest,
        publicLighting: serviceCharges.publicLighting,
        lawContribution: serviceCharges.lawContribution,
        lateFee: serviceCharges.lateFee,
        previousMonthRounding: serviceCharges.previousMonthRounding,
        currentMonthRounding: serviceCharges.currentMonthRounding,
      },
    });

    return this.mapToDomain(updated);
  }

  /**
   * Delete service charges by electricity bill ID
   *
   * @param electricityBillId - The electricity bill ID
   */
  async deleteByElectricityBillId(electricityBillId: string): Promise<void> {
    await this.prisma.serviceCharges.delete({
      where: { electricityBillId },
    });
  }

  /**
   * Map Prisma ServiceCharges model to domain ServiceCharges entity
   *
   * @param prismaServiceCharges - The Prisma ServiceCharges model
   * @returns The domain ServiceCharges entity
   */
  private mapToDomain(prismaServiceCharges: PrismaServiceCharges): ServiceCharges {
    return new ServiceCharges(
      prismaServiceCharges.electricityBillId,
      Number(prismaServiceCharges.maintenanceAndReplacement),
      Number(prismaServiceCharges.fixedCharge),
      Number(prismaServiceCharges.compensatoryInterest),
      Number(prismaServiceCharges.publicLighting),
      Number(prismaServiceCharges.lawContribution),
      Number(prismaServiceCharges.lateFee),
      Number(prismaServiceCharges.previousMonthRounding),
      Number(prismaServiceCharges.currentMonthRounding),
      prismaServiceCharges.createdAt,
      prismaServiceCharges.updatedAt,
      prismaServiceCharges.id
    );
  }
}

