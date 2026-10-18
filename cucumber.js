/**
 * Cucumber configuration — the primary runner for this suite.
 *
 * Feature files describe behaviour in business language; step definitions in
 * src/bdd/steps/ translate them into calls on the shared page objects.
 * Select a profile with `cucumber-js --profile <name>`.
 */
const isCI = !!process.env.CI;

const common = {
  paths: ['features/**/*.feature'],
  import: ['src/bdd/**/*.js'],
  format: [
    'pretty',
    'html:reports/cucumber/report.html',
    'junit:reports/cucumber/junit.xml',
    'json:reports/cucumber/report.json',
  ],
  formatOptions: { snippetInterface: 'async-await' },
  parallel: isCI ? 2 : 1,
  retry: isCI ? 2 : 0,
  // Fail the run on undefined or pending steps instead of silently skipping them.
  strict: true,
};

export default common;

/** Fast gate for PRs. */
export const smoke = { ...common, tags: '@smoke' };

/** Validate that every step is defined, without opening a browser. */
export const dry = { ...common, dryRun: true, format: ['progress'] };
