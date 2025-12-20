import { Page, expect } from '@playwright/test';

export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('http://localhost:3000/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  async isVisible() {
    // Wait for dashboard content to be visible
    // Adjust selector based on actual dashboard structure
    await expect(this.page.locator('body')).toBeVisible();
  }

  async getConsumptionStats() {
    // This will need to be adjusted based on actual dashboard structure
    const stats = {
      water: null as string | null,
      electricity: null as string | null,
      totalCost: null as string | null,
    };

    // Try to find consumption stats elements
    // These selectors are placeholders and should be adjusted
    const waterElement = this.page.locator('[data-testid="water-consumption"]');
    const electricityElement = this.page.locator('[data-testid="electricity-consumption"]');
    const costElement = this.page.locator('[data-testid="total-cost"]');

    if (await waterElement.isVisible()) {
      stats.water = await waterElement.textContent();
    }
    if (await electricityElement.isVisible()) {
      stats.electricity = await electricityElement.textContent();
    }
    if (await costElement.isVisible()) {
      stats.totalCost = await costElement.textContent();
    }

    return stats;
  }

  async navigateToConsumption() {
    // Navigate via sidebar or menu
    const consumptionLink = this.page.locator('a[href*="consumption"], a:has-text("Consumo")');
    if (await consumptionLink.isVisible()) {
      await consumptionLink.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async navigateToBilling() {
    const billingLink = this.page.locator('a[href*="billing"], a:has-text("Facturación")');
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
}
