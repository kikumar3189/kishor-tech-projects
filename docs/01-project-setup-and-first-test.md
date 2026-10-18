# 01 — Project Setup & First Test

**Goal:** initialise a Playwright + Node.js framework and write a first test that opens the Partner Portal and verifies the **Enter Email** text box is displayed.

- URL: `https://partner.gripinvest.in/`
- Element: `//input[@data-testid="auth_form_email_input"]`

---

## Step 1 — Prerequisites

- Node.js ≥ 20 (project pins 22 LTS in `.nvmrc`; run `nvm use`)
- npm (ships with Node)
- Git

## Step 2 — Initialise the project

```bash
git init
npm init -y
```

Then edit `package.json`:

- `"type": "module"` — use modern ES modules (`import`/`export`).
- `"private": true` — prevents accidental publishing to npm.
- `"engines": { "node": ">=20" }` — documents the supported runtime.
- Add `scripts` so everyone runs tests the same way (Week 1 needs `test:pw`, `lint`, `format`; the full list is in the [README](../README.md)).

## Step 3 — Install dependencies

```bash
npm i -D @playwright/test dotenv
npm i -D eslint @eslint/js globals eslint-plugin-playwright prettier eslint-config-prettier
npx playwright install chromium
```

| Package            | Why                                                                            |
| ------------------ | ------------------------------------------------------------------------------ |
| `@playwright/test` | Test runner, assertions, browser automation                                    |
| `dotenv`           | Loads `.env` into `process.env`                                                |
| `eslint` + plugins | Static checks; the Playwright plugin flags missing `await`s, `test.only`, etc. |
| `prettier`         | Consistent formatting, no style debates in review                              |

> We use `npm i -D @playwright/test` rather than `npm init playwright@latest` so every file in the repo is deliberate — no generated example tests to delete.

## Step 4 — Create the folder structure

```bash
mkdir -p config src/pages src/fixtures tests/ui/auth docs
```

See [00 — Framework Architecture](00-framework-architecture.md) for what each folder is for.

## Step 5 — Environment configuration (`config/env.js`)

All environment-specific values live in one module. It loads `.env`, picks the environment named by `TEST_ENV` (default `prod`), allows `BASE_URL` to override, and fails fast on an unknown environment name.

```js
const environments = {
  prod: { baseURL: 'https://partner.gripinvest.in' },
};
```

Create `.env.example` (committed) and copy it to `.env` (git-ignored).

## Step 6 — Playwright config (`playwright.config.js`)

Key decisions:

| Setting                          | Value                | Reason                                              |
| -------------------------------- | -------------------- | --------------------------------------------------- |
| `use.baseURL`                    | from `env.baseURL`   | Tests navigate with relative paths (`goto('/')`)    |
| `use.testIdAttribute`            | `data-testid`        | Matches the attribute Grip's frontend uses          |
| `fullyParallel`                  | `true`               | Forces tests to be independent; faster runs         |
| `forbidOnly`                     | `true` on CI         | A stray `test.only` can't silently skip the suite   |
| `retries`                        | 2 on CI, 0 locally   | Surfaces flakiness locally instead of hiding it     |
| `trace` / `screenshot` / `video` | kept on failure only | Full diagnostics without bloating passing runs      |
| `reporter`                       | list + HTML + JUnit  | Console, human-readable report, CI-parsable results |
| `outputDir` / report folders     | under `reports/`     | One git-ignored folder for all generated output     |

Only the `chromium` project is enabled for now; Firefox/WebKit/mobile can be added to `projects` later.

## Step 7 — Page objects

`src/pages/BasePage.js` holds shared behaviour (`page`, `path`, `open()`).

`src/pages/LoginPage.js` models the sign-in screen:

```js
export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.emailInput = page.getByTestId('auth_form_email_input');
  }

  get path() {
    return '/';
  }
}
```

### Why `getByTestId` instead of the given XPath?

`page.getByTestId('auth_form_email_input')` targets **exactly the same element** as `//input[@data-testid="auth_form_email_input"]` (because `testIdAttribute` is `data-testid`), but:

- it's the locator Playwright recommends for test IDs,
- it's shorter and reads as intent,
- it isn't coupled to the tag name — if the field becomes a custom component, the test survives.

If you ever need the raw XPath, `page.locator('xpath=//input[@data-testid="auth_form_email_input"]')` works, but prefer the above.

## Step 8 — Custom fixtures (`src/fixtures/index.js`)

```js
export const test = base.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});
export { expect };
```

Specs import from here so they receive page objects automatically. As the suite grows, fixtures will also handle things like authenticated sessions and test data.

## Step 9 — The first test (`tests/ui/auth/login.spec.js`)

```js
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
```

Notes:

- **Arrange/Act → Assert** is visually separated.
- `toBeVisible()` is a web-first assertion: it retries until the element appears or `expect.timeout` (10 s) elapses. No sleeps.
- Tags let us run `npm run test:smoke` in a fast pipeline stage.

## Step 10 — Code quality tooling

- `eslint.config.js` — JS recommended rules + Playwright recommended rules for `tests/**`, with Prettier-conflicting rules disabled.
- `.prettierrc.json` — single quotes, trailing commas, 100-column width.

```bash
npm run lint
npm run format
```

## Step 11 — CI (`.github/workflows/e2e.yml`)

On push/PR: install → lint → install Chromium → run tests → upload `reports/` as an artifact (even on failure). `TEST_ENV` can be chosen when triggering manually.

## Step 12 — Run it

```bash
npm run test:pw
```

> From Week 2 onward `npm test` runs the Cucumber suite; this Week 1 spec runs with `npm run test:pw`.

Expected:

```
Running 1 test using 1 worker
  ✓  1 [chromium] › tests/ui/auth/login.spec.js › Login page › displays the email input to an unauthenticated partner @smoke @auth
  1 passed
```

Open the report with `npm run report:pw`.

## Verifying the test can fail

A test that can't fail is worthless. Temporarily change the test ID in `LoginPage.js` to `auth_form_email_input_X` and run again — it should fail after ~10 s with a clear "element(s) not found" message and a saved trace in `reports/test-results/`. Revert the change.

## Checklist

- [ ] `npm run test:pw` passes
- [ ] `npm run lint` passes
- [ ] `npm run format:check` passes
- [ ] No hard-coded URLs in specs or page objects
- [ ] Assertions live only in the spec
