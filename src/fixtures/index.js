import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/index.js';

/**
 * Project-wide test object. Specs import { test, expect } from here, never
 * from '@playwright/test' directly, so page objects arrive ready-built.
 */
export const test = base.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect };
