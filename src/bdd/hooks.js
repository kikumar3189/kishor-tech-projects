import { mkdir } from 'node:fs/promises';
import { After, AfterAll, Before, BeforeAll, setDefaultTimeout, Status } from '@cucumber/cucumber';
import { chromium, selectors } from '@playwright/test';
import { env } from '../../config/env.js';
import { timeouts } from '../../config/timeouts.js';

const TRACE_DIR = 'reports/cucumber/traces';

setDefaultTimeout(timeouts.test);
selectors.setTestIdAttribute('data-testid');

/** One browser per worker process; one isolated context per scenario. */
let browser;

BeforeAll(async function () {
  browser = await chromium.launch({ headless: !process.env.HEADED });
});

AfterAll(async function () {
  await browser?.close();
});

Before(async function () {
  this.context = await browser.newContext({ baseURL: env.baseURL });
  this.context.setDefaultTimeout(timeouts.action);
  this.context.setDefaultNavigationTimeout(timeouts.navigation);
  await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  this.page = await this.context.newPage();
});

// Mirrors Playwright Test's `retain-on-failure`: diagnostics only for failures.
After(async function ({ pickle, result }) {
  if (result?.status === Status.FAILED) {
    this.attach(await this.page.screenshot({ fullPage: true }), 'image/png');
    await mkdir(TRACE_DIR, { recursive: true });
    const tracePath = `${TRACE_DIR}/${pickle.name.replace(/\W+/g, '_')}-${pickle.id}.zip`;
    await this.context.tracing.stop({ path: tracePath });
    this.attach(`Trace: npx playwright show-trace ${tracePath}`);
  } else {
    await this.context.tracing.stop();
  }
  await this.context.close();
});
