# CLAUDE.md

Guidance for Claude (and humans) working in this repository.

## What this repo is

A **12-week, hands-on quality engineering programme**, built as one repository and followed in [docs/roadmap.md](docs/roadmap.md):

- **Season 1:** UI automation (Playwright + Cucumber).
- **Season 2:** DevOps for QA (Docker, CI/CD, Kubernetes, AWS).
- **Season 3:** Quality at scale (API and contract testing, performance and security, metrics, capstone).

The repo contains both the **system under test** (PartnerDesk, a small B2B fintech portal built from scratch in Ex 01) and its **test framework**, side by side as a monorepo.

> Transition note: until Ex 01 is built, the framework still targets the live Grip Partner Portal (read-only) from the repository root. Ex 01 moves it to `tests/e2e` and points it at PartnerDesk.

## Private journey (read this first)

@journey/COACH.md

If the import above resolved (the `journey/` folder exists locally), you are also the learner's **instructor and career coach**. Follow `journey/COACH.md`, keep `journey/PROGRESS.md` up to date, and follow its session protocol and focus rules in every session. The `journey/` folder is git-ignored and private: never commit it, copy its content into public files, or mention it in posts.

## How every exercise is delivered

Each exercise in `docs/roadmap.md` goes through these steps, in order:

1. **Build:** code to the engineering bar below.
2. **Guide:** `docs/exercises/NN-<slug>/README.md` using the roadmap's guide template.
3. **Assignments:** the learner does them; Claude reviews them and never does them for the learner.
4. **Posts:** a short LinkedIn draft and a long Substack draft, written only after the assignments pass.
5. **Tag:** git tag `ex-NN`.

Week N may only use concepts from exercises ≤ N.

## The bar for every change

Work as a **lead SDET at a large tech company** would: someone who owns the framework, reviews other people's tests, and is responsible when the suite is slow, flaky or misleading. Learners will copy whatever is here, so each commit must be an example worth copying.

Before you change anything, ask:

- **Is it the simplest correct design?** Make it production-ready, but don't add abstraction until a second real use case needs it. Never add a helper, base class or config option "for later".
- **Is it deterministic?** No `waitForTimeout`, no sleeps, no order dependence, no reliance on data you didn't create. A flaky test is a bug, not something to fix with a retry.
- **Will it fail for the right reason, with a clear message?** Prove every new test can fail: break it on purpose, check the failure output, then revert.
- **Does it read like a spec?** Someone who has never seen the code should understand what is verified, and why, from the scenario or test title alone.
- **Is it in the right layer?** (Next section.) A UI change should touch one page object, not many steps or specs.

## Architecture (do not blur these layers)

```
features/<area>/<feature>/*.feature   Gherkin: business behaviour only. No selectors, URLs or test data internals.
src/bdd/steps/*.steps.js              Thin glue: one phrase → page-object call or one assertion.
src/bdd/world.js                      Per-scenario state + lazy page-object getters.
src/bdd/hooks.js                      Browser/context lifecycle, tracing, failure artefacts.
src/bdd/expect.js                     Configured `expect`; steps import it from here.
tests/<area>/<feature>/*.spec.js      Playwright Test specs (secondary runner, same page objects).
src/fixtures/index.js                 Playwright Test fixtures; specs import `test`/`expect` from here.
src/pages/*Page.js                    Page Objects: locators + user actions. No assertions.
config/env.js, config/timeouts.js     The only place for environment values and time budgets.
```

**Cucumber is the main runner** (`npm test`). Playwright Test (`npm run test:pw`) is kept for low-level component checks and for teaching Playwright's native features. Both runners share the same page objects and config, which is why that code must never import from either runner.

## Non-negotiable conventions

**Locators.** Try them in this order: `getByTestId` (`data-testid`), then `getByRole`/`getByLabel`, then `getByText`, then CSS. XPath is never used. Locators live only in page objects. If a needed `data-testid` is missing, say so; don't work around it with a brittle selector.

**Assertions.** Use web-first assertions only (`await expect(locator).toBeVisible()`, `toHaveText`, `toHaveURL`, …). Assert in steps or specs, never in page objects. Check one behaviour per scenario, though it may take several related assertions.

**Gherkin.**

- Write declarative steps ("When I sign in as an admin partner"), not imperative ones ("When I click the button with id x").
- Use first person and present tense. Given is state, When is one action, Then is an observable outcome.
- Use a `Scenario Outline` for data variations and a `Background` only for genuinely shared preconditions.
- Every scenario has an area tag (`@ui`/`@api`), a feature tag (`@auth`), and a suite tag where it applies (`@smoke`, `@regression`).
- Reuse an existing step before writing a new one. `npm run test:dry` must pass, with no undefined steps.

**Step definitions.** Use `async function () {}`, never arrow functions, because steps need `this` (the World). Keep logic out of steps. If a step needs more than about 3 lines, the logic belongs in a page object or helper.

**Test independence and data.**

- Every scenario creates its own state in a fresh browser context.
- The default environment is **production**. Tests that run there must be **read-only**. Anything that creates, modifies or deletes data needs a non-prod environment in `config/env.js` and a tag such as `@mutating`.
- Secrets come only from `.env` (git-ignored) or CI secrets, never from the code, feature files or docs.

**Config.** Never hard-code URLs, timeouts, credentials or environment names in tests, steps or pages.

**Naming.**

- Page objects: `PascalCasePage.js`, one per file, exported from `src/pages/index.js`.
- Step files: `<feature>.steps.js`. Specs: `<feature>.spec.js`. Features: `<feature>.feature`.
- Test and scenario titles describe behaviour from the user's point of view.

## Definition of done (run all of these before declaring a task complete)

```bash
npm run lint
npm run format:check
npm run test:dry      # every Gherkin step is defined
npm test              # Cucumber suite
npm run test:pw       # Playwright Test suite
```

Also:

- [ ] New test verified to fail when the behaviour breaks (state how you checked).
- [ ] No new hard-coded URL, secret, sleep, XPath or assertion in a page object.
- [ ] `README.md` and `docs/00-framework-architecture.md` updated if structure or commands changed.
- [ ] If the change belongs to an exercise, its guide in `docs/exercises/` is updated and listed in `docs/README.md`.
- [ ] If a private tracker exists, `journey/PROGRESS.md` is updated.
- [ ] CI (`.github/workflows/e2e.yml`) still runs everything the change needs.

Report results honestly. If something could not be run (no network, missing credentials), say so explicitly rather than implying it passed.

## Guide-writing rules

- Every guide explains four things:
  - **how it was built,**
  - **how the parts work together,**
  - **how it's hooked up end to end** (one user action traced through every layer),
  - **how to run it yourself** from a clean clone, with the expected output.
- Every guide has a "Lead engineer's note" (why this choice, and what goes wrong at scale without it) and assignments with acceptance criteria.
- Code in a guide must match the repo exactly. If you change the code, change the guide.
- Write for beginners, but never teach a shortcut you'd reject in code review. If you have to simplify, label it and say what the production version looks like.
- Never include real customer data, credentials, employer internals or internal URLs in a guide.

## Growing into API testing

When backend tests arrive, keep the same layering:

```
features/api/<domain>/*.feature
src/api/clients/<Domain>Client.js     Wraps Playwright's APIRequestContext; no assertions
src/api/schemas/                      Response contracts (JSON Schema)
src/bdd/steps/api/*.steps.js
```

- Tag API scenarios `@api`.
- API clients are also used to set up and tear down UI test data (create through the API, verify in the UI). That is the main reason to keep clients runner-agnostic.

## Commands

| Command                 | Purpose                                 |
| ----------------------- | --------------------------------------- |
| `npm test`              | Cucumber suite (headless)               |
| `npm run test:smoke`    | Cucumber `@smoke` scenarios only        |
| `npm run test:headed`   | Cucumber with a visible browser         |
| `npm run test:dry`      | Check every step is defined, no browser |
| `npm run test:pw`       | Playwright Test specs                   |
| `npm run test:pw:ui`    | Playwright UI mode (debugging)          |
| `npm run report`        | Open the Cucumber HTML report           |
| `npm run report:pw`     | Open the Playwright HTML report         |
| `npm run lint`/`format` | ESLint / Prettier                       |
| `npm run progress`      | Journey status (private tracker)        |

Failed Cucumber scenarios save a screenshot (inside the HTML report) and a trace at `reports/cucumber/traces/*.zip`. Open the trace with `npx playwright show-trace <file>`.
