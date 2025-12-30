import { IElectricityBillRepository } from '@/src/domain/ElectricityBill/IElectricityBillRepository';
import { IServiceChargesRepository } from '@/src/domain/ServiceCharges/IServiceChargesRepository';
import { IRentalRepository } from '@/src/domain/Rental/IRentalRepository';
import { IConsumptionRepository } from '@/src/domain/Consumption/IConsumptionRepository';
import { IInvoiceRepository } from '@/src/domain/Invoice/IInvoiceRepository';
import { IPropertyRepository } from '@/src/domain/Property/IPropertyRepository';
import { ITransactionManager } from '@/src/domain/Shared/ITransactionManager';
import { Invoice } from '@/src/domain/Invoice/Invoice';
import { logger } from '@/lib/logger';
import {
  ElectricityBillNotFoundError,
  ElectricityBillPropertyMismatchError,
  PropertyNotFoundError,
  PropertyNoAdministratorsError,
} from '@/src/domain/Invoice/errors/InvoiceErrors';

const IGV_RATE = 0.18; // 18% IGV

export class CreateInvoicesForProperty {
  constructor(
    private electricityBillRepository: IElectricityBillRepository,
    private serviceChargesRepository: IServiceChargesRepository,
    private rentalRepository: IRentalRepository,
    private consumptionRepository: IConsumptionRepository,
    private invoiceRepository: IInvoiceRepository,
    private propertyRepository: IPropertyRepository,
    private transactionManager: ITransactionManager
  ) {}

  async execute(
    propertyId: string,
    electricityBillId: string,
    month: number,
    year: number,
    waterCost: number
  ): Promise<Invoice[]> {
    // 1. Obtener datos base
    const electricityBill = await this.electricityBillRepository.findById(electricityBillId);
    if (!electricityBill) {
      throw new ElectricityBillNotFoundError(electricityBillId);
    }

    if (electricityBill.propertyId !== propertyId) {
      throw new ElectricityBillPropertyMismatchError();
    }

    const serviceCharges =
      await this.serviceChargesRepository.findByElectricityBillId(electricityBillId);

    // Obtener todos los rentals activos de la propiedad en el período
    const periodDate = new Date(year, month - 1, 1);
    const activeRentals = await this.rentalRepository.findActiveByPropertyId(
      propertyId,
      periodDate
    );

    // Obtener consumptions de todos los inquilinos para el período
    const consumptionsMap = new Map<string, number>();
    let totalTenantConsumption = 0;

    for (const rental of activeRentals) {
      const consumption = await this.consumptionRepository.findByRentalMonthYear(
        rental.id,
        month,
        year
      );

      if (consumption) {
        const consumptionForPeriod = consumption.getConsumptionForPeriod();
        consumptionsMap.set(rental.id, consumptionForPeriod);
        totalTenantConsumption += consumptionForPeriod;
      }
    }

    // 2. Calcular consumo propio
    const ownConsumption = Math.max(Number(electricityBill.totalKWh) - totalTenantConsumption, 0);

    // Obtener administradores de la propiedad
    const propertyData = await this.propertyRepository.findByIdWithAdministrators(propertyId);

    if (!propertyData) {
      throw new PropertyNotFoundError(propertyId);
    }

    const administrators = propertyData.administrators;
    const numberOfAdministrators = administrators.length;

    if (numberOfAdministrators === 0) {
      throw new PropertyNoAdministratorsError();
    }

    // Calcular costos
    const costPerKWh = electricityBill.getCostPerKWh();
    const numberOfPeople = activeRentals.length + numberOfAdministrators;

    // Calcular servicios por persona
    const servicesBeforeIGVPerPerson = serviceCharges
      ? serviceCharges.getTotalBeforeIGVPerPerson(numberOfPeople)
      : 0;
    const servicesAfterIGVPerPerson = serviceCharges
      ? serviceCharges.getTotalAfterIGVPerPerson(numberOfPeople)
      : 0;

    // Calcular costo de agua por persona (equitativo)
    const waterCostPerPerson = waterCost / numberOfPeople;

    // 3. Crear invoices usando transacción para garantizar atomicidad
    const invoices = await this.transactionManager.execute(
      async (tx) => {
        const createdInvoices: Invoice[] = [];

        // Crear invoice para cada inquilino
        for (const rental of activeRentals) {
          // Validar que no exista invoice para ese rentalId + month + year (dentro de la transacción)
          const existingInvoice = await this.invoiceRepository.findByRentalMonthYearInTransaction(
            rental.id,
            month,
            year,
            tx
          );

          if (existingInvoice) {
            continue; // Skip if invoice already exists
          }

          const tenantConsumption = consumptionsMap.get(rental.id) || 0;

          // Calcular costo de energía para el inquilino
          // (consumoIndividual × costoPorKWh + serviciosAntesIGVporPersona) × 1.18 + serviciosDespuesIGVporPersona
          const energyCostBeforeIGV = tenantConsumption * costPerKWh + servicesBeforeIGVPerPerson;
          const energyCostWithIGV = energyCostBeforeIGV * (1 + IGV_RATE);
          const energyCost = energyCostWithIGV + servicesAfterIGVPerPerson;

          // Calcular total
          const totalCost = energyCost + waterCostPerPerson;

          const now = new Date();
          const invoice = new Invoice(
            rental.id,
            month,
            year,
            waterCostPerPerson,
            energyCost,
            totalCost,
            'UNPAID',
            null,
            null,
            null,
            now,
            now
          );

          // Crear invoice dentro de la transacción
          const created = await this.invoiceRepository.createInTransaction(invoice, tx);
          createdInvoices.push(created);
        }

        // Crear invoice para cada administrador (consumo propio dividido equitativamente)
        const ownConsumptionPerAdmin = ownConsumption / numberOfAdministrators;

        for (const admin of administrators) {
          // Buscar rental del administrador para esta propiedad
          // Si no existe, crear un "virtual rental" o usar un rental especial
          // Por ahora, asumimos que el administrador puede tener un rental
          const adminRental = activeRentals.find((r) => r.getUserId() === admin.id);

          if (adminRental) {
            // Si el admin ya tiene un rental activo, usar ese
            // Validar que no exista invoice (dentro de la transacción)
            const existingInvoice = await this.invoiceRepository.findByRentalMonthYearInTransaction(
              adminRental.id,
              month,
              year,
              tx
            );

            if (existingInvoice) {
              continue;
            }

            const energyCostBeforeIGV =
              ownConsumptionPerAdmin * costPerKWh + servicesBeforeIGVPerPerson;
            const energyCostWithIGV = energyCostBeforeIGV * (1 + IGV_RATE);
            const energyCost = energyCostWithIGV + servicesAfterIGVPerPerson;

            const totalCost = energyCost + waterCostPerPerson;

            const now = new Date();
            const invoice = new Invoice(
              adminRental.id,
              month,
              year,
              waterCostPerPerson,
              energyCost,
              totalCost,
              'UNPAID',
              null,
              null,
              null,
              now,
              now
            );

            const created = await this.invoiceRepository.createInTransaction(invoice, tx);
            createdInvoices.push(created);
          } else {
            // Si el admin no tiene rental, necesitamos crear uno o manejar de otra manera
            // Por ahora, lanzamos un error o lo saltamos
            // TODO: Considerar crear rentals virtuales para administradores
            logger.warn('Administrator missing rental for property', {
              adminId: admin.id,
              propertyId,
            });
          }
        }

        return createdInvoices;
      },
      {
        isolationLevel: 'Serializable',
      }
    );

    return invoices;
  }
}
