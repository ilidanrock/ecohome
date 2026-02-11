import { Page, expect } from '@playwright/test';

export class AdminDashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('http://localhost:3000/admin/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  async isVisible() {
    // Wait for admin dashboard content to be visible
    await expect(this.page.locator('body')).toBeVisible();
  }

  async navigateToConsumptionManagement() {
    // Link in main only — avoids strict mode (sidebar + main can have same link)
    const consumptionLink = this.page
      .getByRole('main')
      .getByRole('link', { name: /Consumo Energético/ });
    await consumptionLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToBilling() {
    const billingLink = this.page
      .getByRole('main')
      .locator('a[href*="billing"], a:has-text("Facturación"), a:has-text("Reportes")');
    await billingLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToPayments() {
    const paymentsLink = this.page
      .getByRole('main')
      .locator('a[href*="payment"], a:has-text("Pagos")');
    await paymentsLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToProperties() {
    const propertiesLink = this.page
      .getByRole('main')
      .locator('a[href*="properties"], a:has-text("Propiedades")');
    await propertiesLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToUsers() {
    const usersLink = this.page
      .getByRole('main')
      .locator('a[href*="users"], a:has-text("Usuarios")');
    await usersLink.click();
    await this.page.waitForLoadState('networkidle');
  }
}
