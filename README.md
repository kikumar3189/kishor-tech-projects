# Grip Partner Portal — E2E Test Automation

Cucumber + Playwright + Node.js framework for automated testing of the [Grip Partner Portal](https://partner.gripinvest.in/).

## Quick start

```bash
nvm use                 # Node 22 LTS (any >= 20 works)
npm install
npm run browsers:install
cp .env.example .env    # adjust if needed
npm test
```

## Common commands

| Command               | What it does                              |
| --------------------- | ----------------------------------------- |
| `npm test`            | Run all Cucumber scenarios (main suite)   |
| `npm run test:smoke`  | Run only `@smoke` scenarios               |
| `npm run test:headed` | Run Cucumber with a visible browser       |
| `npm run test:dry`    | Check every Gherkin step has a definition |
| `npm run test:pw`     | Run the Playwright Test specs             |
| `npm run test:pw:ui`  | Open Playwright's interactive UI mode     |
| `npm run report`      | Open the Cucumber HTML report             |
| `npm run report:pw`   | Open the Playwright HTML report           |
| `npm run lint`        | ESLint (incl. Playwright rules)           |
| `npm run format`      | Prettier format                           |

## Project layout

```
config/env.js            Environment config (TEST_ENV, BASE_URL)
config/timeouts.js       Time budgets shared by both runners
features/ui/<feature>/   Gherkin feature files (Cucumber — main suite)
src/bdd/                 Cucumber World, hooks, configured expect, step definitions
src/pages/               Page Objects — locators + user actions, no assertions
src/fixtures/index.js    Playwright Test fixtures that inject page objects
tests/ui/<feature>/      Playwright Test specs, grouped by feature
docs/                    One guide per exercise
.github/workflows/       CI pipeline
reports/                 Generated: HTML, JUnit, traces (git-ignored)
```

## Documentation

Start with [docs/README.md](docs/README.md). Contributors (human or AI) must follow [CLAUDE.md](CLAUDE.md).
