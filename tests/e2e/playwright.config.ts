import path from 'path';
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const isCI = !!process.env.CI;
const projectRoot = path.resolve(__dirname, '../..');

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
    headless: isCI,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15000,
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
    cwd: projectRoot,
    reuseExistingServer: !isCI,
    timeout: isCI ? 180 * 1000 : 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  expect: {
    timeout: 10000,
  },
  // Timeout global para cada test
  timeout: 60000, // 60 segundos por test
});
