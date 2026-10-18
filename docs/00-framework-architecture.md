# 00 — Framework Architecture

This document explains **how the framework is organised and why**. Read it before adding tests.

## Layers

```
┌───────────────────────────────────────────────────────────────┐
│ features/  Gherkin scenarios (Cucumber)  │ tests/  PW specs   │  ← what we verify
├───────────────────────────────────────────────────────────────┤
│ src/bdd/   steps · World · hooks         │ src/fixtures       │  ← wiring / setup / teardown
├───────────────────────────────────────────────────────────────┤
│ src/pages   Page Objects                 │  ← how we interact with the UI
├──────────────────────────────────────────┤
│ config/     Environment configuration    │  ← where we run
└──────────────────────────────────────────┘
```

**Cucumber is the main runner** (`npm test`); Playwright Test (`npm run test:pw`) is the secondary runner for low-level checks. Both share the page objects and config below them, so those layers must never import from either runner.

Each layer depends only on the layers below it. A UI change should touch a page object, not dozens of specs. A new environment should touch `config/env.js`, not any test.

## Design principles

1. **Page Object Model (POM).** Each screen has a class in `src/pages/`. It owns that screen's locators and exposes user-level actions (`open()`, later `login(email)` etc.). Page objects **do not assert** — specs decide what "correct" means.
2. **Fixtures over `beforeEach` boilerplate.** Specs ask for `{ loginPage }` and get a ready instance. Always import `test`/`expect` from `src/fixtures/index.js`, never from `@playwright/test`. In Cucumber the World plays this role (`this.loginPage`), and steps import `expect` from `src/bdd/expect.js`.
3. **Declarative Gherkin, thin steps.** Feature files describe behaviour, never selectors or clicks. A step definition is one page-object call or one assertion.
4. **Resilient locators, in this order of preference:**
   1. `getByTestId()` — stable contract with developers (`data-testid`)
   2. `getByRole()` / `getByLabel()` — user-facing and accessible
   3. `getByText()` — for static copy
   4. CSS — last resort
   5. XPath — avoid; brittle and hard to read
5. **Web-first assertions only.** Use `await expect(locator).toBeVisible()` (auto-retries). Never `waitForTimeout()` or manual sleeps.
6. **Configuration, not constants.** URLs, timeouts and credentials come from `config/env.js` / `.env`. Secrets are never committed.
7. **Independent tests.** Each test sets up its own state and can run alone, in any order, in parallel (`fullyParallel: true`).
8. **Tags for selection.** `@smoke`, `@regression`, plus a feature tag (`@auth`). Run subsets with `--grep`.
9. **Diagnostics on failure.** Traces, screenshots and videos (Playwright Test) and traces + screenshots (Cucumber) are kept only for failed tests; CI retries twice and publishes `reports/` as an artifact.
10. **Static quality gates.** ESLint (with `eslint-plugin-playwright`, which catches missing `await`s, focused tests, etc.) and Prettier run locally and in CI.

## Naming conventions

| Item         | Convention                            | Example                                                  |
| ------------ | ------------------------------------- | -------------------------------------------------------- |
| Page object  | `PascalCase` + `Page`, one per file   | `src/pages/LoginPage.js`                                 |
| Spec file    | `<feature>.spec.js` under feature dir | `tests/ui/auth/login.spec.js`                            |
| Feature file | `<feature>.feature` under feature dir | `features/ui/auth/login.feature`                         |
| Step file    | `<feature>.steps.js`                  | `src/bdd/steps/auth.steps.js`                            |
| Fixture name | `camelCase` of the class              | `loginPage`                                              |
| Test title   | Behaviour, from the user's view       | `displays the email input to an unauthenticated partner` |

## Environments

`config/env.js` holds a map of environments. Choose one with `TEST_ENV` (default `prod`); override a single value with `BASE_URL`.

```bash
TEST_ENV=prod npm test
BASE_URL=https://some-preview.example.com npm test
HEADED=1 npm test   # watch Cucumber run in a visible browser
```

To add an environment (e.g. staging), add an entry to the `environments` map — nothing else changes.
