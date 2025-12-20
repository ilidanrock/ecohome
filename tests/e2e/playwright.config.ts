import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './specs',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI
    ? [
        ['html'],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
      ]
    : 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    headless: isCI, // Headless en CI, con UI en desarrollo
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15000, // Aumentado para operaciones que pueden tardar (OCR, etc.)
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Proyectos específicos por rol (opcional, para tests que requieren roles específicos)
    {
      name: 'admin-tests',
      use: {
        ...devices['Desktop Chrome'],
        // Puedes agregar storage state aquí si guardas sesiones
      },
      testMatch: /.*admin.*\.spec\.ts/,
    },
    {
      name: 'user-tests',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: /.*user.*\.spec\.ts/,
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  expect: {
    timeout: 10000,
  },
  // Timeout global para cada test
  timeout: 60000, // 60 segundos por test
});
