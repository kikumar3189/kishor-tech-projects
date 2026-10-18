import 'dotenv/config';

/**
 * Central, environment-aware configuration.
 *
 * Every environment-specific value lives here and nowhere else. Tests and page
 * objects read from this module; they never hard-code URLs or credentials.
 * Select an environment with TEST_ENV (defaults to "prod"); override any single
 * value with its own env var (e.g. BASE_URL) for ad-hoc runs.
 */
const environments = {
  prod: {
    baseURL: 'https://partner.gripinvest.in',
  },
};

const envName = process.env.TEST_ENV ?? 'prod';
const selected = environments[envName];

if (!selected) {
  throw new Error(
    `Unknown TEST_ENV "${envName}". Expected one of: ${Object.keys(environments).join(', ')}`,
  );
}

export const env = Object.freeze({
  name: envName,
  baseURL: process.env.BASE_URL ?? selected.baseURL,
});
