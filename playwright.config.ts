import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for the Weather App.
 * The dev server is started automatically before the tests run.
 */
export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: '**/performance.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:4175',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    serviceWorkers: 'block',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'pnpm dev --host localhost --port 4175 --strictPort',
    url: 'http://localhost:4175',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
