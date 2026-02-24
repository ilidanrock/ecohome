import { test, expect } from '@playwright/test';
import { AuthHelper } from '../support/auth';
import { ApiHelper } from '../support/api';
import { DatabaseHelper } from '../support/database';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { testUsers, createTestUser, cleanupTestUser, getTestUser } from '../fixtures/users';
import { createTestProperty, getTestPropertyData } from '../fixtures/properties';
import { createTestRental, getTestRentalData } from '../fixtures/rentals';

test.setTimeout(60000);

test.describe('Property Management', () => {
  let apiHelper: ApiHelper;
  let databaseHelper: DatabaseHelper;
  let authHelper: AuthHelper;
  let adminCookies: string[] = [];
  let adminUserId: string = '';
  let userId: string = '';
  let userId2: string = '';
  let propertyId: string = '';

  test.beforeAll(async ({ browser }) => {
    apiHelper = new ApiHelper();
    await apiHelper.init();
    databaseHelper = new DatabaseHelper();

    await databaseHelper.cleanupTestData(testUsers.admin.email);
    await databaseHelper.cleanupTestData(testUsers.user.email);
    await databaseHelper.cleanupTestData(testUsers.user2.email);

    const adminData = getTestUser('admin');
    const adminUser = await createTestUser(adminData, apiHelper);
    adminUserId = adminUser.id;

    const userData = getTestUser('user');
    const user = await createTestUser(userData, apiHelper);
    userId = user.id;

    const user2Data = getTestUser('user2');
    const user2 = await createTestUser(user2Data, apiHelper);
    userId2 = user2.id;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    const adminAuthHelper = new AuthHelper(adminPage);
    try {
      await adminAuthHelper.login(adminData.email, adminData.password);
      const adminCookiesFromPage = await adminContext.cookies();
      adminCookies = adminCookiesFromPage.map((c) => `${c.name}=${c.value}`);
    } catch (error) {
      console.error('Failed to login as admin:', error);
      adminCookies = [];
    } finally {
      await adminContext.close();
    }

    const propertyData = getTestPropertyData();
    const property = await createTestProperty(propertyData, adminCookies, apiHelper);
    propertyId = property.id;

    const rentalData = getTestRentalData(userId, propertyId);
    await createTestRental(rentalData, adminCookies, apiHelper);
  });

  test.afterAll(async () => {
    await cleanupTestUser(testUsers.admin.email, databaseHelper);
    await cleanupTestUser(testUsers.user.email, databaseHelper);
    await cleanupTestUser(testUsers.user2.email, databaseHelper);
    await apiHelper.cleanup();
    await databaseHelper.disconnect();
  });

  test('ADMIN ve listado de propiedades', async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();

    const adminDashboard = new AdminDashboardPage(page);
    await adminDashboard.goto();
    await adminDashboard.navigateToProperties();

    await expect(page).toHaveURL(/\/admin\/properties/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /Propiedades/ })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('link', { name: /Nueva propiedad/ })).toBeVisible();
    await expect(page.getByText('Test Property')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('123 Test Street')).toBeVisible();
  });

  test('ADMIN puede crear propiedad desde UI', async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();

    await page.goto('/admin/properties/new');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /Nueva propiedad/ })).toBeVisible({
      timeout: 5000,
    });
    await page.locator('#name').fill('E2E Edificio Sur');
    await page.locator('#address').fill('Calle E2E 456');
    await page.getByRole('button', { name: /Crear propiedad/ }).click();

    await expect(page).toHaveURL(/\/admin\/properties(?!\/)/, { timeout: 10000 });
    await expect(page.getByText('E2E Edificio Sur')).toBeVisible({ timeout: 5000 });
  });

  test('ADMIN puede abrir detalle de propiedad', async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();

    await page.goto('/admin/properties');
    await page.waitForLoadState('networkidle');

    await page.getByText('Test Property').first().click();
    await expect(page).toHaveURL(new RegExp(`/admin/properties/${propertyId}`), { timeout: 10000 });
    await expect(page.getByText('Detalle de la propiedad')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#detail-name')).toHaveValue('Test Property');
    await expect(page.locator('#detail-address')).toHaveValue('123 Test Street, Test City');
  });

  test('ADMIN puede actualizar nombre/dirección en detalle', async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();

    await page.goto(`/admin/properties/${propertyId}`);
    await page.waitForLoadState('networkidle');

    await page.locator('#detail-name').fill('Test Property Actualizado');
    await page.locator('#detail-address').fill('Nueva dirección 789');
    await page.getByRole('button', { name: /Guardar cambios/ }).click();

    await expect(page.getByText('Propiedad actualizada')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#detail-name')).toHaveValue('Test Property Actualizado');
    await expect(page.locator('#detail-address')).toHaveValue('Nueva dirección 789');
  });

  test('ADMIN puede asignar inquilino', async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();

    await page.goto(`/admin/properties/${propertyId}`);
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder(/Buscar por nombre o email/).click();
    await page.getByPlaceholder(/Buscar por nombre o email/).fill('user2@test.com');
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: /User2/ }).click();

    await page.locator('#rental-start').click();
    await page.getByRole('combobox').first().selectOption({ index: 5 });
    await page.getByRole('combobox').nth(1).selectOption('2024');
    await page.getByRole('button', { name: '1' }).first().click();
    await page.getByRole('button', { name: 'Añadir inquilino' }).click();
    await expect(page.getByText('Inquilino asignado')).toBeVisible({ timeout: 10000 });
  });

  test('ADMIN puede dar de baja inquilino', async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();

    await page.goto(`/admin/properties/${propertyId}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('User Test')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Dar de baja' }).first().click();
    await expect(page.getByText('Dar de baja asignación')).toBeVisible({ timeout: 3000 });
    await page.getByRole('button', { name: 'Aceptar' }).click();

    await expect(page.getByText('Asignación dada de baja')).toBeVisible({ timeout: 5000 });
  });

  test('ADMIN puede eliminar propiedad', async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();

    await page.goto('/admin/properties');
    await page.waitForLoadState('networkidle');

    const row = page.getByRole('row').filter({ hasText: 'E2E Edificio Sur' });
    await row.getByRole('button', { name: /Eliminar/ }).click();
    await expect(page.getByText(/Eliminar la propiedad/)).toBeVisible({ timeout: 3000 });
    await page.getByRole('button', { name: 'Aceptar' }).click();

    await expect(page.getByText('Propiedad eliminada')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('E2E Edificio Sur')).not.toBeVisible({ timeout: 3000 });
  });

  test('USER no puede acceder a listado de propiedades', async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.loginAsUser();

    await page.goto('/admin/properties');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });
});
