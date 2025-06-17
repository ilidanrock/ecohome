import {  MeterReading, Bill, ElectricityBill, WaterBill } from '../types/bills';

export class BillService {
  // Calcular consumo de electricidad
  static calculateElectricityConsumption(readings: MeterReading[]): number {
    const sortedReadings = [...readings].sort((a, b) => a.date.getTime() - b.date.getTime());
    const lastReading = sortedReadings[sortedReadings.length - 1];
    const firstReading = sortedReadings[0];
    
    return lastReading.reading - firstReading.reading;
  }

  // Calcular recibo de electricidad
  static createElectricityBill(
    propertyId: string,
    readings: MeterReading[],
    startDate: Date,
    endDate: Date,
    unitPrice: number
  ): ElectricityBill {
    const consumption = this.calculateElectricityConsumption(readings);
    const totalAmount = consumption * unitPrice;
    
    return {
      id: crypto.randomUUID(),
      propertyId,
      type: 'electricity',
      startDate,
      endDate,
      totalConsumption: consumption,
      totalAmount,
      previousReading: readings[0].reading,
      currentReading: readings[readings.length - 1].reading,
      tenants: [], // Se llenará cuando se asigne a los inquilinos
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Calcular recibo de agua
  static createWaterBill(
    propertyId: string,
    totalAmount: number,
    startDate: Date,
    endDate: Date,
    totalTenants: number
  ): WaterBill {
    const perTenantAmount = totalAmount / totalTenants;
    
    return {
      id: crypto.randomUUID(),
      propertyId,
      type: 'water',
      startDate,
      endDate,
      totalConsumption: 1, // Para agua no necesitamos consumo específico
      totalAmount,
      totalTenants,
      perTenantAmount,
      tenants: [], // Se llenará cuando se asigne a los inquilinos
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Asignar recibo a inquilinos
  static assignBillToTenants(bill: Bill, tenants: string[]): Bill {
    const billPerTenant = bill.totalAmount / tenants.length;
    
    bill.tenants = tenants.map(tenantId => ({
      tenantId,
      amount: billPerTenant
    }));

    bill.updatedAt = new Date();
    return bill;
  }
}
