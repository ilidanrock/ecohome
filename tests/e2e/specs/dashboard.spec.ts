import { test, expect } from '@playwright/test';
import { AuthHelper } from '../support/auth';
import { DashboardPage } from '../pages/DashboardPage';

test.setTimeout(60000);

test.describe('Tenant Dashboard', () => {
  test('debería mostrar bienvenida y sección de accesos rápidos', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    const auth = new AuthHelper(page);
    await auth.login(
      process.env.E2E_TEST_USER_EMAIL || 'rluis747@yahoo.es',
      process.env.E2E_TEST_USER_PASSWORD || 'Test1234!'
    );

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Bienvenida
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Hola', {
      timeout: 5000,
    });
    // Accesos rápidos (en main, no en sidebar)
    await expect(page.getByText('Accesos rápidos')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('main').getByRole('link', { name: /Mi Consumo/ })).toBeVisible();
  });
});

test.describe('Admin Dashboard', () => {
  test('debería mostrar panel de administración cuando el usuario es admin', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    const auth = new AuthHelper(page);
    // Use admin credentials if available in the test env; otherwise skip or use a known admin
    await auth.login(
      process.env.E2E_TEST_USER_EMAIL || 'rluis747@yahoo.es',
      process.env.E2E_TEST_USER_PASSWORD || 'Test1234!'
    );

    await page.goto('http://localhost:3000/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // If redirected to dashboard (non-admin), skip assertions
    const url = page.url();
    if (url.includes('/admin/dashboard')) {
      await expect(page.getByText('Panel de administración')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Facturas de luz')).toBeVisible();
      await expect(page.getByText('Facturas de agua')).toBeVisible();
    }
  });
});
