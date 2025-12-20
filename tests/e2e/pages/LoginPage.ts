import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async login(email: string, password: string) {
    await this.goto();

    // Wait for email input to be visible
    await this.page.waitForSelector('input[name="email"]', { state: 'visible' });
    await this.page.fill('input[name="email"]', email);

    await this.page.waitForSelector('input[name="password"]', { state: 'visible' });
    await this.page.fill('input[name="password"]', password);

    // Click submit button
    await this.page.click('button[type="submit"]');

    // Wait for navigation to complete
    await Promise.race([
      this.page.waitForURL(/\/dashboard|\/admin\/dashboard/, { timeout: 10000 }),
      this.page.waitForTimeout(10000),
    ]);
  }

  async isVisible() {
    await expect(this.page.locator('input[name="email"]')).toBeVisible();
    await expect(this.page.locator('input[name="password"]')).toBeVisible();
    await expect(this.page.locator('button[type="submit"]')).toBeVisible();
  }

  async getErrorMessage() {
    const errorElement = this.page.locator('.text-destructive, [role="alert"]');
    if (await errorElement.isVisible()) {
      return await errorElement.textContent();
    }
    return null;
  }
}
