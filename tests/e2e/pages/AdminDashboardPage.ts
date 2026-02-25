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
    // Sidebar + quick links both have this; click first (sidebar)
    const consumptionLink = this.page.getByRole('link', { name: 'Consumo Energético' }).first();
    await consumptionLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToBilling() {
    // Sidebar + quick links both have Reportes; click first (sidebar)
    const billingLink = this.page.getByRole('link', { name: 'Reportes' }).first();
    await billingLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToPayments() {
    const paymentsLink = this.page.getByRole('link', { name: 'Pagos' }).first();
    await paymentsLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToProperties() {
    const propertiesLink = this.page.getByRole('link', { name: 'Propiedades' }).first();
    await propertiesLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToUsers() {
    const usersLink = this.page.getByRole('link', { name: 'Usuarios' }).first();
    await usersLink.click();
    await this.page.waitForLoadState('networkidle');
  }
}
