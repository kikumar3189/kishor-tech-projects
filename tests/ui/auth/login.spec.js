import { test, expect } from '../../../src/fixtures/index.js';

test.describe('Login page', () => {
  test(
    'displays the email input to an unauthenticated partner',
    { tag: ['@smoke', '@auth'] },
    async ({ loginPage }) => {
      await loginPage.open();

      await expect(loginPage.emailInput).toBeVisible();
    },
  );
});
