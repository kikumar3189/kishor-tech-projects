import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '../expect.js';

// Steps stay thin: phrase → page-object call or assertion. No locators here.

Given('I am an unauthenticated partner', async function () {
  // Each scenario starts in a fresh browser context with no cookies or storage.
  await this.context.clearCookies();
});

When('I open the login page', async function () {
  await this.loginPage.open();
});

Then('I should see the email input', async function () {
  await expect(this.loginPage.emailInput).toBeVisible();
});
