/**
 * Behaviour shared by every page object.
 * Page objects expose locators and user-level actions; assertions stay in specs.
 */
export class BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  /** Route of this page relative to baseURL. Subclasses override. */
  get path() {
    return '/';
  }

  async open() {
    await this.page.goto(this.path);
  }
}
