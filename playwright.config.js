import { defineConfig, devices } from '@playwright/test';
import { env } from './config/env.js';
import { timeouts } from './config/timeouts.js';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  outputDir: './reports/test-results',

  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,

  timeout: timeouts.test,
  expect: { timeout: timeouts.expect },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
  ],

  use: {
    baseURL: env.baseURL,
    testIdAttribute: 'data-testid',
    actionTimeout: timeouts.action,
    navigationTimeout: timeouts.navigation,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
