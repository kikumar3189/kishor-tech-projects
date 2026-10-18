/**
 * Timeouts shared by every runner (Playwright Test and Cucumber), so both
 * behave identically. Change a budget here, never inline in a test.
 */
export const timeouts = Object.freeze({
  /** Whole test / scenario. */
  test: 30_000,
  /** Web-first assertions (`expect(locator)...`). */
  expect: 10_000,
  /** Single action: click, fill, etc. */
  action: 10_000,
  /** page.goto and other navigations. */
  navigation: 30_000,
});
