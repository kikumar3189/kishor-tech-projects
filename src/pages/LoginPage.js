import { BasePage } from './BasePage.js';

/** Partner Portal sign-in screen (landing page for unauthenticated partners). */
export class LoginPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.emailInput = page.getByTestId('auth_form_email_input');
  }

  get path() {
    return '/';
  }
}
