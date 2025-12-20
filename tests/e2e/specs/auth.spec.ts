import { test, expect } from '@playwright/test';
import { AuthHelper } from '../support/auth';

// Configurar el tiempo de espera para las pruebas
test.setTimeout(60000);

test.describe('Autenticación', () => {
  test('debería permitir iniciar sesión con credenciales válidas', async ({ page }) => {
    const auth = new AuthHelper(page);

    // Navegar a la página de login
    await page.goto('http://localhost:3000/login');

    // Tomar captura de pantalla para depuración
    await page.screenshot({ path: 'test-results/login-page.png' });

    // Verificar que estamos en la página de login
    await expect(page).toHaveURL(/\/login$/, { timeout: 10000 });

    // Verificar que los campos del formulario son visibles
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();

    try {
      // Intentar iniciar sesión
      await auth.login('rluis747@yahoo.es', 'Test1234!');

      // Tomar captura de pantalla después del login
      await page.screenshot({ path: 'test-results/after-login.png' });

      // Verificar que estamos en el dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

      // Verificar que el dashboard se cargó correctamente (el dashboard puede estar vacío, solo verificamos la URL)
      await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
    } catch (error) {
      // Tomar captura de pantalla en caso de error
      await page.screenshot({ path: 'test-results/login-error.png' });

      // Obtener el HTML de la página para depuración
      const html = await page.content();
      console.log('PAGE HTML:', html.substring(0, 1000) + '...');

      throw error;
    }
  });
});
