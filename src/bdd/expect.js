import { expect as baseExpect } from '@playwright/test';
import { timeouts } from '../../config/timeouts.js';

/**
 * Project-wide `expect` for step definitions. `configure()` returns a new
 * instance rather than mutating the global one, so steps must import from
 * here, never from '@playwright/test' directly.
 */
export const expect = baseExpect.configure({ timeout: timeouts.expect });
