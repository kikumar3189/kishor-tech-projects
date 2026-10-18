# Roadmap — Quality Engineering, End to End

A 12-week, hands-on series. We build a small fintech product, then test it, containerise it, ship it through CI/CD to Kubernetes and AWS, and measure its quality, the way a lead engineer at a large tech company would.

- **Cadence:** one exercise per week, worked in 2–3 sessions of 60–90 minutes.
- **Every exercise ships:** working code, a guide in `docs/exercises/`, assignments to complete yourself, and a git tag `ex-NN`, so you can start from exactly where the previous exercise ended.
- **System under test:** **PartnerDesk**, a B2B portal where financial distributors sign in, manage their clients and place fixed-income orders. It's built in this repo, from scratch, for teaching. It contains no real company's code or data.

| Season | Month   | Theme                                                                |
| ------ | ------- | -------------------------------------------------------------------- |
| 1      | Month 1 | **UI test automation** with Playwright + Cucumber                    |
| 2      | Month 2 | **DevOps for QA**: Docker, CI/CD, Kubernetes, AWS                    |
| 3      | Month 3 | **Quality at scale**: API, non-functional testing, metrics, capstone |

## Target repository layout (reached gradually)

```
apps/web            PartnerDesk frontend (React + Vite)
apps/api            PartnerDesk API (Node + Fastify) + unit/integration tests
tests/e2e           Cucumber + Playwright framework (this repo's current code moves here in Ex 01)
tests/perf          k6 load tests                      (Ex 10)
infra/docker        Dockerfiles + docker-compose        (Ex 01 for dependencies, Ex 05 for everything)
infra/k8s           Kubernetes manifests / Helm chart   (Ex 07)
infra/terraform     AWS infrastructure                  (Ex 08)
.github/workflows   CI/CD pipelines                     (Ex 06 onward)
docs/exercises      One guide per exercise
docs/adr            Architecture decision records
```

---

## Season 1 — UI test automation (Month 1)

### Ex 01 — Own your system under test

- **Build:**
  - Convert the repo into a monorepo with npm workspaces.
  - PartnerDesk v1: email + OTP login and an empty dashboard. Postgres and Mailpit (a fake mail server that catches the OTP emails) run in Docker Compose.
  - Move the existing framework into `tests/e2e` and point it at PartnerDesk.
  - The first Playwright test and the first Cucumber scenario.
- **You learn:** how a test framework is put together, config vs code, Gherkin, the World and hooks.
- **Assignments:**
  - Run the whole stack from a clean clone.
  - Trace one login end to end: browser → API → database → email.
  - Add a `data-testid` to the app and a scenario that uses it.

### Ex 02 — Locators, Page Objects & data-driven BDD

- **Build:** a client list and an "Add client" form with validation (PAN format, mobile number, email). Page objects. `Scenario Outline` negative tests. The locator strategy.
- **You learn:** which locators survive a redesign, what a page object is (and isn't), declarative vs imperative Gherkin, negative testing.
- **Assignments:**
  - Write 5 validation scenarios without writing any new step code.
  - Fix a "bad PR" seeded with brittle locators.

### Ex 03 — Authentication, roles & test data

- **Build:**
  - Admin and Relationship Manager roles.
  - The test reads the OTP from Mailpit's API.
  - One saved login session (`storageState`) per role.
  - Test data seeded and cleaned up through the API.
  - The order placement flow.
- **You learn:** session reuse, OTP strategies, test-data strategies, why tests must not depend on each other, killing flakiness with the Trace Viewer.
- **Assignments:**
  - Write a role-permission scenario.
  - Make a shared-data test self-contained.
  - Diagnose a planted flaky test using only its trace.

### Ex 04 — Network control, visual & accessibility testing, reporting

- **Build:**
  - Mock API failures, empty states and slow responses with `page.route`.
  - Assert on the payloads the UI sends.
  - `toHaveScreenshot` with masking.
  - axe-core accessibility scans.
  - Firefox and WebKit projects.
- **You learn:** testing states you can't reproduce on demand, and the test pyramid.
- **Assignments:**
  - Mock a slow order submission and check the loading state.
  - Add accessibility checks to every page.
  - Write the Season 1 retro.

## Season 2 — DevOps for QA (Month 2)

### Ex 05 — Docker

- **Build:**
  - Multi-stage, non-root images for `web` and `api`.
  - A test-runner image based on Playwright's official image.
  - One `docker compose` command that runs the stack and the suite.
- **You learn:** images, layers, caching, networks, volumes, and "works on my machine" vs reproducible.
- **Assignments:**
  - Shrink an image.
  - Break and then fix layer caching.
  - Run the suite on a clean machine with one command.

### Ex 06 — CI/CD with GitHub Actions

- **Build:**
  - A PR pipeline: lint → unit → build images → compose up → smoke E2E → reports and a PR comment.
  - Splitting tests across parallel jobs (a sharding matrix), caching, and a nightly regression run.
  - Branch protection as a quality gate, and a tag to quarantine flaky tests.
- **You learn:** pipeline design, quality gates, fast feedback vs full coverage, and diagnosing failures from artifacts.
- **Assignments:**
  - Diagnose a red build using only the CI artifacts.
  - Cut pipeline time by 30%.
  - Add a gate of your own.

### Ex 07 — Kubernetes

- **Build:**
  - A local `kind` cluster.
  - Deployments, Services, ConfigMaps, Secrets, Ingress, and health checks (probes).
  - Postgres running in the cluster.
  - The E2E suite running as Kubernetes Jobs.
  - A throwaway namespace for each PR in CI.
- **You learn:** pods, deployments, services, probes, and running tests inside a cluster.
- **Assignments:**
  - Kill a pod and watch it recover.
  - Debug a planted `CrashLoopBackOff`.
  - Run the suite as parallel Jobs.

### Ex 08 — AWS

- **Build:**
  - Terraform for ECR, ECS Fargate (or App Runner) and RDS.
  - GitHub Actions logs into AWS with short-lived credentials (OIDC), with no stored access keys.
  - Every merge deploys to staging, then the regression suite runs against it.
  - Budget alarms and a one-command teardown.
  - Optional: a single-day EKS lab.
- **You learn:** IAM, least privilege, container registries, managed compute, and controlling cost.
- **Assignments:**
  - Deploy and tear down the stack yourself.
  - Tighten an IAM policy.
  - Write a monthly cost estimate.

## Season 3 — Quality at scale (Month 3)

### Ex 09 — API & contract testing for money

- **Build:**
  - API features in Cucumber, with JSON Schema contracts.
  - Decimal and rounding rules for money.
  - Idempotency keys on orders.
  - Tests for the order state machine.
  - Database-level assertions.
- **You learn:** the risks specific to fintech, and how to test them below the UI.
- **Assignments:**
  - Find a seeded rounding bug.
  - Write idempotency and state-transition scenarios.

### Ex 10 — Performance, security & observability in the pipeline

- **Build:**
  - k6 load tests with thresholds as a CI gate.
  - An OWASP ZAP baseline security scan.
  - Structured logs and basic metrics from the API.
- **You learn:** shifting non-functional testing left, and choosing meaningful thresholds.
- **Assignments:**
  - Catch a planted performance regression.
  - Triage the ZAP findings.

### Ex 11 — Quality metrics dashboard

- **Build:**
  - Collect CI data (pass rate, flaky-test rate, duration, coverage of critical journeys) plus DORA metrics from GitHub into a dashboard.
  - Write architecture decision records (ADRs) for the major choices.
- **You learn:** metrics that drive decisions vs vanity metrics.
- **Assignments:** read the dashboard and write a one-page quality summary.

### Ex 12 — Capstone

- **Build:**
  - Polish the repo and add an architecture diagram.
  - Write a "scaling this to 10 teams" document.
  - Release `v1.0`.
  - A 5-minute walkthrough script.
- **Assignments:** present the walkthrough end to end.

---

## Guide template (every exercise)

1. **What we built:** the goal and the finished picture.
2. **How it was built:** step by step, with the reasoning.
3. **How it works together:** a component diagram and the request/data flow.
4. **End to end:** one user action traced through every layer.
5. **Run it yourself:** from a clean clone, with expected output.
6. **Prove it can fail:** break it on purpose and read the failure.
7. **Lead engineer's note:** what goes wrong at scale without this.
8. **Assignments:** hands-on tasks with acceptance criteria.
9. **Checklist.**
