import { setWorldConstructor, World } from '@cucumber/cucumber';
import { LoginPage } from '../pages/index.js';

/**
 * Per-scenario state. Cucumber creates a fresh World for every scenario, so
 * nothing leaks between them. Hooks fill in `context` and `page`; steps reach
 * page objects through the lazy getters below (the Cucumber equivalent of the
 * Playwright Test fixtures in src/fixtures/index.js).
 */
export class PortalWorld extends World {
  /** @type {import('@playwright/test').BrowserContext} */
  context;
  /** @type {import('@playwright/test').Page} */
  page;

  #pages = new Map();

  /** Build a page object once per scenario and reuse it across steps. */
  #pageObject(PageClass) {
    if (!this.#pages.has(PageClass)) this.#pages.set(PageClass, new PageClass(this.page));
    return this.#pages.get(PageClass);
  }

  get loginPage() {
    return this.#pageObject(LoginPage);
  }
}

setWorldConstructor(PortalWorld);
