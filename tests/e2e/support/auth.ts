import { Page } from '@playwright/test';
import { testUsers } from '../fixtures/users';

export class AuthHelper {
  private baseURL = 'http://localhost:3000';

  constructor(private page: Page) {}

  async login(email: string, password: string) {
    try {
      await this.page.goto(`${this.baseURL}/login`, { waitUntil: 'networkidle' });

      // Wait for email input to be visible
      await this.page.waitForSelector('input[name="email"]', { state: 'visible', timeout: 10000 });
      await this.page.fill('input[name="email"]', email);

      await this.page.waitForSelector('input[name="password"]', {
        state: 'visible',
        timeout: 10000,
      });
      await this.page.fill('input[name="password"]', password);

      // Set up navigation promise BEFORE clicking
      const navigationPromise = this.page.waitForURL(/\/dashboard|\/admin\/dashboard/, {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      });

      // Click submit button
      const submitButton = this.page.locator('button[type="submit"]');
      await submitButton.waitFor({ state: 'visible', timeout: 5000 });
      await submitButton.click();

      // Wait for navigation
      await navigationPromise;

      // Additional wait to ensure page is fully loaded
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      // Verify we're actually logged in by checking URL
      const currentUrl = this.page.url();
      if (!currentUrl.includes('/dashboard') && !currentUrl.includes('/admin/dashboard')) {
        throw new Error(`Login failed - still on ${currentUrl}`);
      }
    } catch (error) {
      console.error('Error during login:', error);
      // Take screenshot for debugging
      const currentUrl = this.page.url();
      console.error(`Current URL after login attempt: ${currentUrl}`);
      const pageContent = await this.page.content();
      console.error(`Page content (first 500 chars): ${pageContent.substring(0, 500)}`);
      await this.page
        .screenshot({ path: 'test-results/login-error.png', fullPage: true })
        .catch(() => {});
      throw error;
    }
  }

  /**
   * Login as admin using test credentials
   */
  async loginAsAdmin() {
    const admin = testUsers.admin;
    await this.login(admin.email, admin.password);
    // Verify we're on admin dashboard
    await this.page.waitForURL(/\/admin\/dashboard/, { timeout: 5000 }).catch(() => {
      // If not redirected, check current URL
      const url = this.page.url();
      if (!url.includes('/admin')) {
        throw new Error('Failed to login as admin - not redirected to admin dashboard');
      }
    });
  }

  /**
   * Login as regular user using test credentials
   */
  async loginAsUser() {
    const user = testUsers.user;
    await this.login(user.email, user.password);
    // Verify we're on user dashboard
    await this.page.waitForURL(/\/dashboard/, { timeout: 5000 }).catch(() => {
      // If not redirected, check current URL
      const url = this.page.url();
      if (!url.includes('/dashboard') || url.includes('/admin')) {
        throw new Error('Failed to login as user - not redirected to user dashboard');
      }
    });
  }

  /**
   * Logout from the application
   */
  async logout() {
    try {
      // Try different logout button selectors
      const logoutSelectors = [
        'button:has-text("Cerrar sesión")',
        'button:has-text("Logout")',
        'button:has-text("Salir")',
        '[data-testid="logout-button"]',
        'a:has-text("Cerrar sesión")',
        'a:has-text("Logout")',
      ];

      let loggedOut = false;
      for (const selector of logoutSelectors) {
        const element = this.page.locator(selector);
        if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
          await element.click();
          loggedOut = true;
          break;
        }
      }

      if (loggedOut) {
        await this.page.waitForURL(/\/login|\//, { timeout: 5000 });
      } else {
        // If no logout button found, try to clear session via API
        await this.page.goto('/api/auth/signout');
        await this.page.waitForURL(/\/login|\//, { timeout: 5000 });
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Continue even if logout fails - session might already be cleared
    }
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    const url = this.page.url();
    return !url.includes('/login') && !url.includes('/register');
  }
}
