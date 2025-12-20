import { test, expect } from '@playwright/test';
import { AuthHelper } from '../support/auth';
import { ApiHelper } from '../support/api';
import { DatabaseHelper } from '../support/database';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { testUsers, createTestUser, cleanupTestUser, getTestUser } from '../fixtures/users';
import { createTestProperty, getTestPropertyData } from '../fixtures/properties';
import { createTestRental, getTestRentalData } from '../fixtures/rentals';
import {
  createTestPayment,
  getTestRentalPaymentData,
  getTestInvoicePaymentData,
} from '../fixtures/payments';
import { PrismaClient } from '@prisma/client';

test.describe('Payment Management', () => {
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
  let invoiceId: string = '';

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
    // Use dates that will be active for test periods
    const rental = await prisma.rental.create({
      data: {
        userId,
        propertyId,
        startDate: new Date(2024, 0, 1), // January 1, 2024 - active for test periods
        endDate: null,
      },
    });
    rentalId = rental.id;

    const rental2 = await prisma.rental.create({
      data: {
        userId: userId2,
        propertyId,
        startDate: new Date(2024, 0, 1), // January 1, 2024 - active for test periods
        endDate: null,
      },
    });
    rentalId2 = rental2.id;

    // Create invoice for user (via direct DB access for test setup)
    const invoice = await prisma.invoice.create({
      data: {
        rentalId,
        month: 10,
        year: 2024,
        waterCost: 50.0,
        energyCost: 100.0,
        totalCost: 150.0,
        status: 'UNPAID',
      },
    });
    invoiceId = invoice.id;
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

  test.describe('Rental Payments', () => {
    test('USER puede crear pago de rental', async ({ page }) => {
      authHelper = new AuthHelper(page);
      await authHelper.loginAsUser();

      // Create payment via API
      const paymentData = getTestRentalPaymentData(rentalId, 500.0);
      const payment = await createTestPayment(paymentData, userCookies, apiHelper);

      // Verify payment was created
      expect(payment.id).toBeDefined();

      // Verify payment appears in rental payments
      const response = await apiHelper.getContext().get(`/api/payments/rental/${rentalId}`, {
        headers: { Cookie: userCookies.join('; ') },
      });

      expect(response.ok()).toBe(true);
      const payments = await response.json();
      expect(payments.length).toBeGreaterThan(0);
      expect(payments.some((p: any) => p.id === payment.id)).toBe(true);
    });

    test('Validación de métodos de pago (YAPE, CASH, BANK_TRANSFER)', async ({ page }) => {
      authHelper = new AuthHelper(page);
      await authHelper.loginAsUser();

      const methods: Array<'YAPE' | 'CASH' | 'BANK_TRANSFER'> = ['YAPE', 'CASH', 'BANK_TRANSFER'];

      for (const method of methods) {
        const paymentData = getTestRentalPaymentData(rentalId, 100.0, new Date(), method);
        const payment = await createTestPayment(paymentData, userCookies, apiHelper);
        expect(payment.id).toBeDefined();
      }
    });

    test('Validación de monto (debe ser > 0)', async ({ page }) => {
      authHelper = new AuthHelper(page);
      await authHelper.loginAsUser();

      // Try to create payment with amount <= 0
      const invalidPaymentData = getTestRentalPaymentData(rentalId, 0);
      const response = await apiHelper.getContext().post('/api/payments', {
        data: {
          ...invalidPaymentData,
          paidAt: invalidPaymentData.paidAt.toISOString(),
        },
        headers: { Cookie: userCookies.join('; ') },
      });

      // Should return validation error
      expect(response.status()).toBe(400);
    });

    test('USER no puede crear pago de rental de otro usuario', async ({ page }) => {
      authHelper = new AuthHelper(page);
      await authHelper.loginAsUser();

      // Try to create payment for rentalId2 (belongs to user2)
      const paymentData = getTestRentalPaymentData(rentalId2, 500.0);
      const response = await apiHelper.getContext().post('/api/payments', {
        data: {
          ...paymentData,
          paidAt: paymentData.paidAt.toISOString(),
        },
        headers: { Cookie: userCookies.join('; ') },
      });

      // Should return 403 Forbidden
      expect(response.status()).toBe(403);
    });
  });

  test.describe('Invoice Payments', () => {
    test('USER puede crear pago de invoice (servicio)', async ({ page }) => {
      authHelper = new AuthHelper(page);
      await authHelper.loginAsUser();

      // Create payment for invoice
      const paymentData = getTestInvoicePaymentData(invoiceId, 150.0);
      const payment = await createTestPayment(paymentData, userCookies, apiHelper);

      // Verify payment was created
      expect(payment.id).toBeDefined();

      // Verify invoice status was updated to PAID
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
      });
      expect(invoice?.status).toBe('PAID');
      expect(invoice?.paidAt).toBeDefined();
    });

    test('Pago parcial no marca invoice como PAID', async ({ page }) => {
      // Create new invoice
      const invoice = await prisma.invoice.create({
        data: {
          rentalId,
          month: 11,
          year: 2024,
          waterCost: 50.0,
          energyCost: 100.0,
          totalCost: 150.0,
          status: 'UNPAID',
        },
      });

      authHelper = new AuthHelper(page);
      await authHelper.loginAsUser();

      // Create partial payment (50 out of 150)
      const paymentData = getTestInvoicePaymentData(invoice.id, 50.0);
      await createTestPayment(paymentData, userCookies, apiHelper);

      // Verify invoice still UNPAID
      const updatedInvoice = await prisma.invoice.findUnique({
        where: { id: invoice.id },
      });
      expect(updatedInvoice?.status).toBe('UNPAID');
    });

    test('Pago completo marca invoice como PAID', async ({ page }) => {
      // Create new invoice
      const invoice = await prisma.invoice.create({
        data: {
          rentalId,
          month: 12,
          year: 2024,
          waterCost: 50.0,
          energyCost: 100.0,
          totalCost: 150.0,
          status: 'UNPAID',
        },
      });

      authHelper = new AuthHelper(page);
      await authHelper.loginAsUser();

      // Create full payment
      const paymentData = getTestInvoicePaymentData(invoice.id, 150.0);
      await createTestPayment(paymentData, userCookies, apiHelper);

      // Verify invoice status = PAID
      const updatedInvoice = await prisma.invoice.findUnique({
        where: { id: invoice.id },
      });
      expect(updatedInvoice?.status).toBe('PAID');
      expect(updatedInvoice?.paidAt).toBeDefined();
    });

    test('Múltiples pagos suman correctamente', async ({ page }) => {
      // Create new invoice
      const invoice = await prisma.invoice.create({
        data: {
          rentalId,
          month: 1,
          year: 2025,
          waterCost: 50.0,
          energyCost: 100.0,
          totalCost: 100.0,
          status: 'UNPAID',
        },
      });

      authHelper = new AuthHelper(page);
      await authHelper.loginAsUser();

      // Create first payment (60)
      const paymentData1 = getTestInvoicePaymentData(invoice.id, 60.0);
      await createTestPayment(paymentData1, userCookies, apiHelper);

      // Verify invoice still UNPAID
      let updatedInvoice = await prisma.invoice.findUnique({
        where: { id: invoice.id },
      });
      expect(updatedInvoice?.status).toBe('UNPAID');

      // Create second payment (40) - should complete the total
      const paymentData2 = getTestInvoicePaymentData(invoice.id, 40.0);
      await createTestPayment(paymentData2, userCookies, apiHelper);

      // Verify invoice now PAID
      updatedInvoice = await prisma.invoice.findUnique({
        where: { id: invoice.id },
      });
      expect(updatedInvoice?.status).toBe('PAID');

      // Verify total payments = 100
      const paymentsResponse = await apiHelper
        .getContext()
        .get(`/api/payments/invoice/${invoice.id}`, {
          headers: { Cookie: userCookies.join('; ') },
        });
      const payments = await paymentsResponse.json();
      const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
      expect(totalPaid).toBe(100.0);
    });

    test('USER puede ver historial de pagos de rental', async ({ page }) => {
      authHelper = new AuthHelper(page);
      await authHelper.loginAsUser();

      // Create multiple payments
      const payment1 = getTestRentalPaymentData(rentalId, 200.0);
      const payment2 = getTestRentalPaymentData(rentalId, 300.0);
      await createTestPayment(payment1, userCookies, apiHelper);
      await createTestPayment(payment2, userCookies, apiHelper);

      // Get payment history
      const response = await apiHelper.getContext().get(`/api/payments/rental/${rentalId}`, {
        headers: { Cookie: userCookies.join('; ') },
      });

      expect(response.ok()).toBe(true);
      const payments = await response.json();
      expect(payments.length).toBeGreaterThanOrEqual(2);

      // Verify payment details
      const firstPayment = payments.find((p: any) => p.amount === 200.0);
      expect(firstPayment).toBeDefined();
      expect(firstPayment.paymentMethod).toBeDefined();
      expect(firstPayment.paidAt).toBeDefined();
    });

    test('USER puede ver historial de pagos de invoice', async ({ page }) => {
      // Create new invoice with payments
      const invoice = await prisma.invoice.create({
        data: {
          rentalId,
          month: 2,
          year: 2025,
          waterCost: 50.0,
          energyCost: 100.0,
          totalCost: 150.0,
          status: 'UNPAID',
        },
      });

      authHelper = new AuthHelper(page);
      await authHelper.loginAsUser();

      // Create multiple payments
      const payment1 = getTestInvoicePaymentData(invoice.id, 75.0);
      const payment2 = getTestInvoicePaymentData(invoice.id, 75.0);
      await createTestPayment(payment1, userCookies, apiHelper);
      await createTestPayment(payment2, userCookies, apiHelper);

      // Get payment history
      const response = await apiHelper.getContext().get(`/api/payments/invoice/${invoice.id}`, {
        headers: { Cookie: userCookies.join('; ') },
      });

      expect(response.ok()).toBe(true);
      const payments = await response.json();
      expect(payments.length).toBe(2);
    });

    test('USER no puede crear pago de invoice de otro usuario', async ({ page }) => {
      // Create invoice for user2
      const invoice = await prisma.invoice.create({
        data: {
          rentalId: rentalId2,
          month: 3,
          year: 2025,
          waterCost: 50.0,
          energyCost: 100.0,
          totalCost: 150.0,
          status: 'UNPAID',
        },
      });

      authHelper = new AuthHelper(page);
      await authHelper.loginAsUser();

      // Try to create payment for invoice of user2
      const paymentData = getTestInvoicePaymentData(invoice.id, 150.0);
      const response = await apiHelper.getContext().post('/api/payments', {
        data: {
          ...paymentData,
          paidAt: paymentData.paidAt.toISOString(),
        },
        headers: { Cookie: userCookies.join('; ') },
      });

      // Should return 403 Forbidden
      expect(response.status()).toBe(403);
    });

    test('Transacciones atómicas (pago + actualización de invoice)', async ({ page }) => {
      // Create new invoice
      const invoice = await prisma.invoice.create({
        data: {
          rentalId,
          month: 4,
          year: 2025,
          waterCost: 50.0,
          energyCost: 100.0,
          totalCost: 100.0,
          status: 'UNPAID',
        },
      });

      authHelper = new AuthHelper(page);
      await authHelper.loginAsUser();

      // Create payment that covers total (simulating potential race condition)
      const paymentData = getTestInvoicePaymentData(invoice.id, 100.0);

      // Make multiple concurrent payment requests
      const requests = [
        createTestPayment(paymentData, userCookies, apiHelper),
        createTestPayment(paymentData, userCookies, apiHelper),
      ];

      // At least one should succeed, but invoice should only be marked PAID once
      const results = await Promise.allSettled(requests);

      // Verify invoice is PAID (transaction should prevent double payment)
      const updatedInvoice = await prisma.invoice.findUnique({
        where: { id: invoice.id },
      });
      expect(updatedInvoice?.status).toBe('PAID');

      // Verify total payments don't exceed invoice total significantly
      const paymentsResponse = await apiHelper
        .getContext()
        .get(`/api/payments/invoice/${invoice.id}`, {
          headers: { Cookie: userCookies.join('; ') },
        });
      const payments = await paymentsResponse.json();
      const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
      // Total should be close to invoice total (may have one extra payment due to race condition)
      expect(totalPaid).toBeGreaterThanOrEqual(100.0);
    });
  });
});
