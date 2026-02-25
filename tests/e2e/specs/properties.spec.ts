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
    // Borrar propiedades de prueba para no dejar basura en la DB
    await databaseHelper.deleteTestPropertyById(propertyId);
    await databaseHelper.deleteTestPropertiesByAdminAndName(adminUserId, 'E2E Edificio Sur');

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
    const main = page.getByRole('main');
    await expect(main.getByRole('table')).toBeVisible({ timeout: 15000 });
    await expect(main.getByRole('table').getByText('Test Property')).toBeVisible({ timeout: 5000 });
    await expect(main.getByRole('table').getByText('123 Test Street')).toBeVisible();
  });

  test('ADMIN puede crear propiedad desde UI', async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();

    await page.goto('/admin/properties/new');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('main').getByText('Nueva propiedad').first()).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('#name')).toBeVisible({ timeout: 5000 });
    await page.locator('#name').fill('E2E Edificio Sur');
    await page.locator('#address').fill('Calle E2E 456');
    await page.getByRole('button', { name: /Crear propiedad/ }).click();

    await expect(page).toHaveURL(/\/admin\/properties(?!\/)/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    const main = page.getByRole('main');
    await expect(main.getByRole('table').getByText('E2E Edificio Sur')).toBeVisible({
      timeout: 15000,
    });
  });

  test('ADMIN puede abrir detalle de propiedad', async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();

    await page.goto('/admin/properties');
    await page.waitForLoadState('networkidle');

    // Desktop: table row; mobile: card (role=button). Wait for the visible one and click.
    const propertyRow = page.getByRole('row').filter({ hasText: 'Test Property' });
    const propertyCard = page.getByRole('button').filter({ hasText: 'Test Property' });
    await expect(propertyRow.or(propertyCard)).toBeVisible({ timeout: 10000 });
    if ((await propertyRow.count()) > 0) await propertyRow.click();
    else await propertyCard.click();
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

    await expect(page.getByRole('main').getByText('Detalle de la propiedad')).toBeVisible({
      timeout: 10000,
    });
    // First combobox in main is the tenant selector (name may not be exposed in a11y tree)
    const tenantCombobox = page.getByRole('main').getByRole('combobox').first();
    await tenantCombobox.click();
    await expect(page.getByPlaceholder(/Buscar por nombre o email/)).toBeVisible({ timeout: 5000 });
    await page.getByPlaceholder(/Buscar por nombre o email/).fill('user2@test.com');
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: /User2/ }).click();

    await page.locator('#rental-start').click();
    // Calendar is in a popover with native <select> for month/year; avoid tenant combobox (input)
    const openPopover = page.locator('[data-state="open"]').filter({ has: page.locator('select') });
    await expect(openPopover.locator('select').first()).toBeVisible({ timeout: 5000 });
    await openPopover.locator('select').first().selectOption({ index: 5 });
    await openPopover.locator('select').nth(1).selectOption('2024');
    await openPopover.getByRole('button', { name: '1' }).first().click();
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

    const main = page.getByRole('main');
    await expect(main.getByRole('table')).toBeVisible({ timeout: 15000 });
    // Search so "E2E Edificio Sur" is on current page (avoids pagination)
    await main.getByPlaceholder(/Buscar por nombre o dirección/).fill('E2E Edificio Sur');
    await main.getByRole('button', { name: 'Buscar' }).click();
    await expect(main.getByRole('table').getByText('E2E Edificio Sur')).toBeVisible({
      timeout: 15000,
    });
    const rowE2E = main
      .getByRole('table')
      .locator('tbody tr')
      .filter({ hasText: 'E2E Edificio Sur' });
    await expect(rowE2E).toBeVisible({ timeout: 5000 });
    await rowE2E.getByRole('button', { name: /Eliminar/ }).click();
    await expect(page.getByText(/Eliminar la propiedad/)).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Aceptar' }).click();

    await expect(page.getByText('Propiedad eliminada')).toBeVisible({ timeout: 5000 });
    await expect(main.getByRole('table').getByText('E2E Edificio Sur')).not.toBeVisible({
      timeout: 5000,
    });
  });

  test('USER no puede acceder a listado de propiedades', async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.loginAsUser();

    await page.goto('/admin/properties');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });
});
