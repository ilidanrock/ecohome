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
    // Navigate via sidebar - adjust selector based on actual admin sidebar
    const consumptionLink = this.page.locator(
      'a[href*="energy"], a:has-text("Consumo Energético"), a:has-text("Consumo")'
    );
    if (await consumptionLink.isVisible()) {
      await consumptionLink.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async navigateToBilling() {
    const billingLink = this.page.locator(
      'a[href*="billing"], a:has-text("Facturación"), a:has-text("Reportes")'
    );
    if (await billingLink.isVisible()) {
      await billingLink.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async navigateToPayments() {
    const paymentsLink = this.page.locator('a[href*="payment"], a:has-text("Pagos")');
    if (await paymentsLink.isVisible()) {
      await paymentsLink.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async navigateToProperties() {
    const propertiesLink = this.page.locator('a[href*="properties"], a:has-text("Propiedades")');
    if (await propertiesLink.isVisible()) {
      await propertiesLink.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async navigateToUsers() {
    const usersLink = this.page.locator('a[href*="users"], a:has-text("Usuarios")');
    if (await usersLink.isVisible()) {
      await usersLink.click();
      await this.page.waitForLoadState('networkidle');
    }
  }
}
