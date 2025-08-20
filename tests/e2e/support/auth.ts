import { Page } from '@playwright/test';

export class AuthHelper {
  private baseURL = 'http://localhost:3000';

  constructor(private page: Page) {}

  async login(email: string, password: string) {
    try {
      await this.page.goto(`${this.baseURL}/login`);
      await this.page.waitForLoadState('networkidle');

      // Wait for email input to be visible
      await this.page.waitForSelector('input[name="email"]', { state: 'visible' });
      await this.page.fill('input[name="email"]', email);

      await this.page.waitForSelector('input[name="password"]', { state: 'visible' });
      await this.page.fill('input[name="password"]', password);

      await this.page.click('button[type="submit"]');

      // Wait for navigation to complete or timeout after 10 seconds
      await Promise.race([
        this.page.waitForURL(/\/dashboard/, { timeout: 10000 }),
        this.page.waitForTimeout(10000),
      ]);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  async logout() {
    await this.page.click('button:has-text("Cerrar sesión")');
    await this.page.waitForURL('/login');
  }
}
