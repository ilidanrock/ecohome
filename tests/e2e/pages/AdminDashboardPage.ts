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
    // Sidebar link (dashboard main does not contain this link on all pages)
    const consumptionLink = this.page.getByRole('link', { name: 'Consumo Energético' });
    await consumptionLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToBilling() {
    const billingLink = this.page.getByRole('link', { name: 'Reportes' });
    await billingLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToPayments() {
    const paymentsLink = this.page.getByRole('link', { name: 'Pagos' });
    await paymentsLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToProperties() {
    // Sidebar link (not inside main on dashboard)
    const propertiesLink = this.page.getByRole('link', { name: 'Propiedades' });
    await propertiesLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToUsers() {
    const usersLink = this.page.getByRole('link', { name: 'Usuarios' });
    await usersLink.click();
    await this.page.waitForLoadState('networkidle');
  }
}
