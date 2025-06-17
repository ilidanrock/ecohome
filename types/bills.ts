export interface Property {
  id: string;
  name: string;
  address: string;
  tenants: string[]; // IDs de los inquilinos
}

export interface User {
  id: string;
  name: string;
  email: string;
  properties: string[]; // IDs de las propiedades que administra
}

export interface MeterReading {
  id: string;
  propertyId: string;
  type: 'electricity' | 'water';
  reading: number;
  date: Date;
  photoUrl?: string;
}

export interface Bill {
  id: string;
  propertyId: string;
  type: 'electricity' | 'water';
  startDate: Date;
  endDate: Date;
  totalConsumption: number;
  totalAmount: number;
  tenants: {
    tenantId: string;
    amount: number;
  }[];
  status: 'pending' | 'paid' | 'overdue';
  createdAt: Date;
  updatedAt: Date;
}

export interface ElectricityBill extends Bill {
  previousReading: number;
  currentReading: number;
}

export interface WaterBill extends Bill {
  totalTenants: number;
  perTenantAmount: number;
}
