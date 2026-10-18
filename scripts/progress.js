#!/usr/bin/env node
/**
 * Prints a short status from the private journey tracker (journey/PROGRESS.md).
 * Runs as a Claude Code SessionStart hook (.claude/settings.json) and on demand
 * via `npm run progress`. Exits silently when the tracker isn't present, so a
 * public clone of the repo is unaffected.
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const TRACKER = fileURLToPath(new URL('../journey/PROGRESS.md', import.meta.url));
const DAY_MS = 24 * 60 * 60 * 1000;

if (!existsSync(TRACKER)) process.exit(0);

const text = readFileSync(TRACKER, 'utf8');
const field = (name) => text.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))?.[1].trim();

/** Each "### Week N — title" section with its checkbox items. */
const weeks = [...text.matchAll(/^### Week (\d+) — (.+)$([\s\S]*?)(?=^##)/gm)].map(
  ([, number, title, body]) => {
    const items = [...body.matchAll(/^- \[( |x)\] (.+)$/gm)].map(([, mark, label]) => ({
      done: mark === 'x',
      label,
    }));
    return { number: Number(number), title, items };
  },
);

const allItems = weeks.flatMap((week) => week.items);
const doneCount = allItems.filter((item) => item.done).length;
const current = weeks.find((week) => week.items.some((item) => !item.done));

const today = new Date();
const daysSince = (date) => Math.floor((today - new Date(date)) / DAY_MS);
const elapsed = daysSince(field('Start date'));
const calendarWeek = Math.min(weeks.length, Math.max(0, Math.floor(elapsed / 7) + 1));
const idleDays = daysSince(field('Last session'));

const lines = [`[Journey] North star: ${field('North star')}`];

if (!current) {
  lines.push('All 12 weeks complete. Focus: applications, interviews, negotiation.');
} else {
  const gap = calendarWeek - current.number;
  const pace =
    elapsed < 0
      ? `starts in ${-elapsed} day(s)`
      : gap > 0
        ? `BEHIND by ${gap} week(s): agree a catch-up plan`
        : gap < 0
          ? `ahead by ${-gap} week(s)`
          : 'on track';
  const next = current.items.find((item) => !item.done);
  lines.push(
    `You are on Week ${current.number}: ${current.title}`,
    `Calendar week: ${calendarWeek}/${weeks.length} (${pace})`,
    `Overall: ${doneCount}/${allItems.length} items (${Math.round((doneCount / allItems.length) * 100)}%)`,
    `Next action: ${next.label}`,
  );
}

lines.push(
  `Last session: ${field('Last session')} (${idleDays} day(s) ago)${idleDays >= 7 ? ': start with a recap' : ''}`,
);

console.log(lines.join('\n'));
