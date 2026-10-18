# 02 — BDD with Cucumber

**Goal:** add Cucumber as the main test runner and express Week 1's check ("the login page shows the email input") as a business-readable scenario. The page objects stay exactly as they are.

---

## Concepts

| Term                | What it is                                                                | Where it lives             |
| ------------------- | ------------------------------------------------------------------------- | -------------------------- |
| **Feature file**    | Plain-language behaviour written in Gherkin (`Given` / `When` / `Then`)   | `features/**/*.feature`    |
| **Step definition** | A function that matches a Gherkin phrase and runs code                    | `src/bdd/steps/*.steps.js` |
| **World**           | A fresh object for each scenario, available as `this` in every step       | `src/bdd/world.js`         |
| **Hooks**           | Code that runs before and after scenarios (start browser, collect traces) | `src/bdd/hooks.js`         |
| **Tags**            | `@smoke`, `@auth`… used to select scenarios                               | On `Feature` / `Scenario`  |

### Why Cucumber in a B2B team?

Product managers, partner-success teams and developers can read `login.feature` and agree on what "working" means **before** anyone writes code. The scenarios become living documentation that is checked on every run.

### Why keep Playwright Test as well?

Cucumber adds a translation layer, which is worth it for user journeys but not for low-level checks. Both runners use the same `src/pages/`, so nothing is duplicated.

---

## Step 1 — Install

```bash
npm i -D @cucumber/cucumber
```

Cucumber runs the scenarios. Playwright is used here as a **library** (`chromium`, `expect`) rather than as a test runner.

## Step 2 — Configuration (`cucumber.js`)

```js
const common = {
  paths: ['features/**/*.feature'],
  import: ['src/bdd/**/*.js'],
  format: [
    'pretty',
    'html:reports/cucumber/report.html',
    'junit:reports/cucumber/junit.xml',
    'json:reports/cucumber/report.json',
  ],
  parallel: isCI ? 2 : 1,
  retry: isCI ? 2 : 0,
  strict: true,
};
export default common;
export const smoke = { ...common, tags: '@smoke' };
export const dry = { ...common, dryRun: true, format: ['progress'] };
```

Each named export is a **profile**: `cucumber-js --profile smoke`.

## Step 3 — The feature file

`features/ui/auth/login.feature`:

```gherkin
@ui @auth
Feature: Partner Portal login
  As a partner of Grip Invest
  I want a clear sign-in screen
  So that I can access my client book securely

  @smoke
  Scenario: Unauthenticated partner sees the email input
    Given I am an unauthenticated partner
    When I open the login page
    Then I should see the email input
```

Notice there are **no selectors, URLs or "click" verbs**. The steps are declarative, so they still make sense if the UI is redesigned.

## Step 4 — The World (`src/bdd/world.js`)

Cucumber creates a new World for every scenario. Ours holds the browser `context` and `page`, and gives steps lazy page objects:

```js
get loginPage() {
  return this.#pageObject(LoginPage);
}
```

This is the Cucumber equivalent of the `{ loginPage }` fixture from Week 1.

## Step 5 — Hooks (`src/bdd/hooks.js`)

| Hook        | Does                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------- |
| `BeforeAll` | Launches Chromium once per worker (`HEADED=1` shows it)                                  |
| `Before`    | New isolated **context** per scenario, with `baseURL` from config, timeouts, tracing on  |
| `After`     | On failure: attaches a screenshot to the report and saves a trace. Always closes context |
| `AfterAll`  | Closes the browser                                                                       |

Launching the browser once and creating a context per scenario is fast **and** isolated. It's the same model Playwright Test uses internally.

## Step 6 — Step definitions (`src/bdd/steps/auth.steps.js`)

```js
When('I open the login page', async function () {
  await this.loginPage.open();
});

Then('I should see the email input', async function () {
  await expect(this.loginPage.emailInput).toBeVisible();
});
```

Rules:

- Use `async function`, **never arrow functions**. Arrow functions don't receive `this`, the World.
- Import `expect` from `src/bdd/expect.js`. `expect.configure()` returns a _new_ instance, so a configured `expect` has to be shared from one module. Otherwise you silently get the 5 s default timeout.
- Keep steps thin, with no locators. Each step either calls a page object or makes one assertion.

## Step 7 — Shared timeouts (`config/timeouts.js`)

Both runners read their test, expect, action and navigation budgets from this one file, so they can never drift apart.

## Run it

```bash
npm run test:dry    # checks every step is defined — no browser
npm test            # runs all scenarios
npm run test:smoke  # @smoke only
npm run report      # opens reports/cucumber/report.html
```

Expected:

```
Feature: Partner Portal login

  @ui @auth @smoke
  Scenario: Unauthenticated partner sees the email input
    ✔ Given I am an unauthenticated partner
    ✔ When I open the login page
    ✔ Then I should see the email input

1 scenario (1 passed)
```

## Prove it can fail

Change the test ID in `src/pages/LoginPage.js` to `auth_form_email_input_X` and run `npm test`. You should see:

- `Timeout: 10000ms` and `element(s) not found` in the output,
- a screenshot embedded in `reports/cucumber/report.html`,
- a trace in `reports/cucumber/traces/`. Open it with `npx playwright show-trace <file>`.

Then revert the change.

## Lead engineer's note

The most common way BDD suites fail is **imperative Gherkin**: `When I click "#submit-btn"`. Every UI change then breaks feature files, and nobody outside QA reads them anymore. Describe _intent_ in Gherkin, keep _mechanics_ in page objects, and review feature files as carefully as code.

## Exercise

Add a second scenario: **"Login page shows the Grip branding"**. Reuse the existing `Given`/`When` steps and add one new `Then`. Put the new locator in `LoginPage`, not in the step.

## Checklist

- [ ] `npm run test:dry` reports no undefined steps
- [ ] `npm test` and `npm run test:pw` both pass
- [ ] No selectors or URLs in `.feature` or `.steps.js` files
- [ ] Every scenario is tagged
