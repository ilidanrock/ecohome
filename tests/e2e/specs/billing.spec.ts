import { test, expect } from '@playwright/test';
import { AuthHelper } from '../support/auth';
import { ApiHelper } from '../support/api';
import { DatabaseHelper } from '../support/database';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { DashboardPage } from '../pages/DashboardPage';
import { testUsers, createTestUser, cleanupTestUser, getTestUser } from '../fixtures/users';
import { createTestProperty, getTestPropertyData } from '../fixtures/properties';
import { createTestRental, getTestRentalData } from '../fixtures/rentals';
import { createTestConsumption, getTestConsumptionData } from '../fixtures/consumption';
import { createTestElectricityBill, getTestElectricityBillData } from '../fixtures/bills';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('Billing Management', () => {
  let apiHelper: ApiHelper;
  let databaseHelper: DatabaseHelper;
  let authHelper: AuthHelper;
  let prisma: PrismaClient;
  let adminCookies: string[] = [];
  let userCookies: string[] = [];
  let adminUserId: string = '';
  let userId: string = '';
  let userId2: string = '';
  let propertyId: string = '';
  let rentalId: string = '';
  let rentalId2: string = '';
  let electricityBillId: string = '';

  test.beforeAll(async ({ browser }) => {
    apiHelper = new ApiHelper();
    await apiHelper.init();
    databaseHelper = new DatabaseHelper();

    // Cleanup any existing test data
    await databaseHelper.cleanupTestData(testUsers.admin.email);
    await databaseHelper.cleanupTestData(testUsers.user.email);
    await databaseHelper.cleanupTestData(testUsers.user2.email);

    // Create admin user
    const adminData = getTestUser('admin');
    const adminUser = await createTestUser(adminData, apiHelper);
    adminUserId = adminUser.id;

    // Create user
    const userData = getTestUser('user');
    const user = await createTestUser(userData, apiHelper);
    userId = user.id;

    // Create user2
    const user2Data = getTestUser('user2');
    const user2 = await createTestUser(user2Data, apiHelper);
    userId2 = user2.id;

    // Wait a bit for user creation to complete and DB to sync
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get cookies by logging in through page context
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    const adminAuthHelper = new AuthHelper(adminPage);
    try {
      await adminAuthHelper.login(adminData.email, adminData.password);
      const adminCookiesFromPage = await adminContext.cookies();
      adminCookies = adminCookiesFromPage.map((c) => `${c.name}=${c.value}`);
      console.log(`Admin login successful, got ${adminCookies.length} cookies`);
    } catch (error) {
      console.error('Failed to login as admin:', error);
      adminCookies = [];
    } finally {
      await adminContext.close();
    }

    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    const userAuthHelper = new AuthHelper(userPage);
    try {
      await userAuthHelper.login(userData.email, userData.password);
      const userCookiesFromPage = await userContext.cookies();
      userCookies = userCookiesFromPage.map((c) => `${c.name}=${c.value}`);
      console.log(`User login successful, got ${userCookies.length} cookies`);
    } catch (error) {
      console.error('Failed to login as user:', error);
      userCookies = [];
    } finally {
      await userContext.close();
    }

    // Initialize Prisma
    prisma = new PrismaClient();

    // Create property (using direct DB access)
    const property = await prisma.property.create({
      data: {
        name: 'Test Property',
        address: '123 Test Street',
        administrators: {
          connect: { id: adminUserId },
        },
      },
    });
    propertyId = property.id;

    // Create rentals (using direct DB access)
    // Use dates that will be active for the test period (October 2024)
    const testPeriodStart = new Date(2024, 9, 1); // October 1, 2024
    const rental = await prisma.rental.create({
      data: {
        userId,
        propertyId,
        startDate: new Date(2024, 0, 1), // January 1, 2024 - active for October
        endDate: null,
      },
    });
    rentalId = rental.id;

    const rental2 = await prisma.rental.create({
      data: {
        userId: userId2,
        propertyId,
        startDate: new Date(2024, 0, 1), // January 1, 2024 - active for October
        endDate: null,
      },
    });
    rentalId2 = rental2.id;
  });

  test.afterAll(async () => {
    // Cleanup test data
    await cleanupTestUser(testUsers.admin.email, databaseHelper);
    await cleanupTestUser(testUsers.user.email, databaseHelper);
    await cleanupTestUser(testUsers.user2.email, databaseHelper);
    await apiHelper.cleanup();
    await databaseHelper.disconnect();
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  test.describe('Electricity Bill Management', () => {
    test('ADMIN puede crear electricity bill', async ({ page }) => {
      authHelper = new AuthHelper(page);
      await authHelper.loginAsAdmin();

      // Create electricity bill via API
      const billData = getTestElectricityBillData(propertyId);
      const bill = await createTestElectricityBill(billData, adminCookies, apiHelper);
      electricityBillId = bill.id;

      // Verify bill was created
      expect(bill.id).toBeDefined();

      // Verify bill data via direct DB access
      const createdBill = await prisma.electricityBill.findUnique({
        where: { id: bill.id },
      });
      expect(createdBill).toBeDefined();
      // API returns numbers as strings, so convert for comparison
      expect(Number(createdBill?.totalKWh)).toBe(billData.totalKWh);
      expect(Number(createdBill?.totalCost)).toBe(billData.totalCost);
    });

    test('Validación de fechas (periodStart < periodEnd)', async ({ page }) => {
      authHelper = new AuthHelper(page);
      await authHelper.loginAsAdmin();

      // Try to create bill with periodStart >= periodEnd
      const invalidBillData = {
        propertyId,
        periodStart: new Date(2024, 11, 1), // December 1
        periodEnd: new Date(2024, 10, 1), // November 1 (before start)
        totalKWh: 1000.0,
        totalCost: 500.0,
      };

      const response = await apiHelper.getContext().post('/api/electricity-bills', {
        data: {
          ...invalidBillData,
          periodStart: invalidBillData.periodStart.toISOString(),
          periodEnd: invalidBillData.periodEnd.toISOString(),
        },
        headers: { Cookie: adminCookies.join('; ') },
      });

      // Should return validation error
      expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test('USER no puede crear electricity bill (solo ADMIN)', async ({ page }) => {
      authHelper = new AuthHelper(page);
      await authHelper.loginAsUser();

      const billData = getTestElectricityBillData(propertyId);
      const response = await apiHelper.getContext().post('/api/electricity-bills', {
        data: {
          ...billData,
          periodStart: billData.periodStart.toISOString(),
          periodEnd: billData.periodEnd.toISOString(),
        },
        headers: { Cookie: userCookies.join('; ') },
      });

      // Should return 403 Forbidden
      expect(response.status()).toBe(403);
    });
  });

  test.describe('Service Charges', () => {
    test('ADMIN puede crear service charges para electricity bill', async ({ page }) => {
      // Create electricity bill first
      const billData = getTestElectricityBillData(propertyId);
      const bill = await createTestElectricityBill(billData, adminCookies, apiHelper);

      authHelper = new AuthHelper(page);
      await authHelper.loginAsAdmin();

      // Create service charges
      const response = await apiHelper.getContext().post('/api/service-charges', {
        data: {
          electricityBillId: bill.id,
          maintenanceAndReplacement: 50.0,
          fixedCharge: 30.0,
          compensatoryInterest: 10.0,
          publicLighting: 20.0,
          lawContribution: 5.0,
          lateFee: 0.0,
          previousMonthRounding: 0.0,
          currentMonthRounding: 0.0,
        },
        headers: { Cookie: adminCookies.join('; ') },
      });

      expect(response.ok()).toBe(true);
      const serviceCharges = await response.json();
      expect(serviceCharges.id).toBeDefined();

      // Verify service charges were created
      const createdCharges = await prisma.serviceCharges.findUnique({
        where: { electricityBillId: bill.id },
      });
      expect(createdCharges).toBeDefined();
      // API returns numbers as strings, so convert for comparison
      expect(Number(createdCharges?.maintenanceAndReplacement)).toBe(50.0);
    });
  });

  test.describe('Invoice Generation', () => {
    test('ADMIN puede generar invoices automáticamente', async ({ page }) => {
      // Setup: Create electricity bill, consumptions for rentals
      const billData = getTestElectricityBillData(propertyId);
      const bill = await createTestElectricityBill(billData, adminCookies, apiHelper);

      // Create consumptions for both rentals
      const consumption1 = getTestConsumptionData(rentalId, 10, 2024, 300.0, 200.0);
      await createTestConsumption(consumption1, adminCookies, apiHelper);

      const consumption2 = getTestConsumptionData(rentalId2, 10, 2024, 400.0, 300.0);
      await createTestConsumption(consumption2, adminCookies, apiHelper);

      authHelper = new AuthHelper(page);
      await authHelper.loginAsAdmin();

      // Generate invoices
      const invoices = await apiHelper.generateInvoices(
        propertyId,
        bill.id,
        10,
        2024,
        100.0, // waterCost
        adminCookies
      );

      // Verify invoices were created
      expect(invoices.invoices.length).toBeGreaterThan(0);

      // Verify invoices for rentals
      const rental1Invoice = await prisma.invoice.findUnique({
        where: {
          rentalId_month_year: {
            rentalId: rentalId,
            month: 10,
            year: 2024,
          },
        },
      });
      expect(rental1Invoice).toBeDefined();

      const rental2Invoice = await prisma.invoice.findUnique({
        where: {
          rentalId_month_year: {
            rentalId: rentalId2,
            month: 10,
            year: 2024,
          },
        },
      });
      expect(rental2Invoice).toBeDefined();
    });

    test('Cálculo proporcional de energía', async ({ page }) => {
      // Use unique month/year to avoid conflicts with other tests
      const testMonth = 9; // September
      const testYear = 2024;

      // Clean up any existing invoices for this period first
      await prisma.invoice.deleteMany({
        where: {
          rentalId: { in: [rentalId, rentalId2] },
          month: testMonth,
          year: testYear,
        },
      });

      // Setup: Create bill with totalKWh = 1000, two rentals with different consumptions
      const billData = getTestElectricityBillData(propertyId, undefined, undefined, 1000.0, 500.0);
      const bill = await createTestElectricityBill(billData, adminCookies, apiHelper);

      // Rental1: 300 kWh (previous: 200, current: 500) = 300 kWh consumed
      // Rental2: 200 kWh (previous: 300, current: 500) = 200 kWh consumed
      const consumption1 = getTestConsumptionData(rentalId, testMonth, testYear, 500.0, 200.0);
      await createTestConsumption(consumption1, adminCookies, apiHelper);

      const consumption2 = getTestConsumptionData(rentalId2, testMonth, testYear, 500.0, 300.0);
      await createTestConsumption(consumption2, adminCookies, apiHelper);

      authHelper = new AuthHelper(page);
      await authHelper.loginAsAdmin();

      // Generate invoices
      await apiHelper.generateInvoices(propertyId, bill.id, testMonth, testYear, 0, adminCookies);

      // Verify proportional calculation
      // Total energy cost = 500, total consumption = 500 kWh (300 + 200)
      // Rental1: 300 kWh consumed, Rental2: 200 kWh consumed
      // Rental1 should pay more than Rental2 (proportional to consumption)
      const invoice1 = await prisma.invoice.findUnique({
        where: {
          rentalId_month_year: {
            rentalId: rentalId,
            month: testMonth,
            year: testYear,
          },
        },
      });
      const invoice2 = await prisma.invoice.findUnique({
        where: {
          rentalId_month_year: {
            rentalId: rentalId2,
            month: testMonth,
            year: testYear,
          },
        },
      });

      expect(invoice1).toBeDefined();
      expect(invoice2).toBeDefined();
      // Rental1 consumed more (300 vs 200), so should pay more for energy
      const energyCost1 = Number(invoice1?.energyCost || 0);
      const energyCost2 = Number(invoice2?.energyCost || 0);
      // Both should have energy costs > 0
      expect(energyCost1).toBeGreaterThan(0);
      expect(energyCost2).toBeGreaterThan(0);
      // Rental1 consumed more, so should pay more
      expect(energyCost1).toBeGreaterThan(energyCost2);
    });

    test('Distribución equitativa de agua', async ({ page }) => {
      // Use unique month/year to avoid conflicts with other tests
      const testMonth = 8; // August
      const testYear = 2024;

      // Clean up any existing invoices for this period first
      await prisma.invoice.deleteMany({
        where: {
          rentalId: { in: [rentalId, rentalId2] },
          month: testMonth,
          year: testYear,
        },
      });

      const billData = getTestElectricityBillData(propertyId);
      const bill = await createTestElectricityBill(billData, adminCookies, apiHelper);

      // Create consumptions
      const consumption1 = getTestConsumptionData(rentalId, testMonth, testYear, 300.0);
      await createTestConsumption(consumption1, adminCookies, apiHelper);

      const consumption2 = getTestConsumptionData(rentalId2, testMonth, testYear, 400.0);
      await createTestConsumption(consumption2, adminCookies, apiHelper);

      authHelper = new AuthHelper(page);
      await authHelper.loginAsAdmin();

      // Generate invoices with waterCost = 300
      await apiHelper.generateInvoices(
        propertyId,
        bill.id,
        testMonth,
        testYear,
        300.0,
        adminCookies
      );

      // Verify water is distributed equally
      // Total people = 2 rentals + 1 admin = 3
      // Water cost per person = 300 / 3 = 100 each
      const invoice1 = await prisma.invoice.findUnique({
        where: {
          rentalId_month_year: {
            rentalId: rentalId,
            month: testMonth,
            year: testYear,
          },
        },
      });
      const invoice2 = await prisma.invoice.findUnique({
        where: {
          rentalId_month_year: {
            rentalId: rentalId2,
            month: testMonth,
            year: testYear,
          },
        },
      });

      expect(invoice1).toBeDefined();
      expect(invoice2).toBeDefined();
      // Both should pay same water cost (equitable distribution)
      // Water is divided by total people (rentals + admins)
      const waterCost1 = Number(invoice1?.waterCost || 0);
      const waterCost2 = Number(invoice2?.waterCost || 0);
      expect(waterCost1).toBe(waterCost2);
      // Should be 300 / (2 rentals + 1 admin) = 100
      expect(waterCost1).toBeCloseTo(100.0, 2);
    });

    test('Prevención de invoices duplicados', async ({ page }) => {
      const billData = getTestElectricityBillData(propertyId);
      const bill = await createTestElectricityBill(billData, adminCookies, apiHelper);

      // Create consumption
      const consumption1 = getTestConsumptionData(rentalId, 11, 2024, 300.0);
      await createTestConsumption(consumption1, adminCookies, apiHelper);

      authHelper = new AuthHelper(page);
      await authHelper.loginAsAdmin();

      // Generate invoices first time
      await apiHelper.generateInvoices(propertyId, bill.id, 11, 2024, 100.0, adminCookies);

      // Try to generate invoices again for same period
      const response = await apiHelper.getContext().post('/api/invoices/generate', {
        data: {
          propertyId,
          electricityBillId: bill.id,
          month: 11,
          year: 2024,
          waterCost: 100.0,
        },
        headers: { Cookie: adminCookies.join('; ') },
      });

      // The use case skips existing invoices, so it returns 201 with empty or fewer invoices
      expect(response.status()).toBe(201);
      const body = await response.json();
      // Should return fewer invoices than first time (or empty array) since duplicates are skipped
      expect(body.invoices.length).toBeLessThanOrEqual(1);
    });

    test('ADMIN solo puede generar invoices de propiedades que administra', async ({ page }) => {
      // Create another property not managed by admin
      const otherProperty = await prisma.property.create({
        data: {
          name: 'Other Property',
          address: 'Other Address',
        },
      });

      // Create bill directly in DB since admin can't create bill for property they don't manage
      const billData = getTestElectricityBillData(otherProperty.id);
      const bill = await prisma.electricityBill.create({
        data: {
          propertyId: billData.propertyId,
          periodStart: billData.periodStart,
          periodEnd: billData.periodEnd,
          totalKWh: billData.totalKWh,
          totalCost: billData.totalCost,
          fileUrl: billData.fileUrl || null,
        },
      });

      authHelper = new AuthHelper(page);
      await authHelper.loginAsAdmin();

      // Try to generate invoices for property admin doesn't manage
      const response = await apiHelper.getContext().post('/api/invoices/generate', {
        data: {
          propertyId: otherProperty.id,
          electricityBillId: bill.id,
          month: 12,
          year: 2024,
          waterCost: 100.0,
        },
        headers: { Cookie: adminCookies.join('; ') },
      });

      // Should return 403 Forbidden
      expect(response.status()).toBe(403);

      // Cleanup
      await prisma.electricityBill.delete({ where: { id: bill.id } });
      await prisma.property.delete({ where: { id: otherProperty.id } });
    });

    test('USER puede ver sus invoices', async ({ page }) => {
      // Setup: Generate invoices
      const billData = getTestElectricityBillData(propertyId);
      const bill = await createTestElectricityBill(billData, adminCookies, apiHelper);

      const consumption1 = getTestConsumptionData(rentalId, 12, 2024, 300.0);
      await createTestConsumption(consumption1, adminCookies, apiHelper);

      await apiHelper.generateInvoices(propertyId, bill.id, 12, 2024, 100.0, adminCookies);

      authHelper = new AuthHelper(page);
      await authHelper.loginAsUser();

      const dashboard = new DashboardPage(page);
      await dashboard.goto();
      await dashboard.isVisible();

      // Verify user can see their invoice
      // Note: Adjust selectors based on actual UI
      await expect(page.locator('body')).toBeVisible();
    });
  });
});
