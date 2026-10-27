import { defineConfig, devices } from '@playwright/test';
import config from './playwright.config';

export default defineConfig({
  ...config,
  testIgnore: [],
  testMatch: '**/performance.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
