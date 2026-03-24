const DAY_MS = 24 * 60 * 60 * 1000;
const LAUNCH_DAY_UTC_MS = Date.UTC(2026, 2, 21, 16, 0, 0);
const CANONICAL_TZ_OFFSET_MS = 8 * 60 * 60 * 1000;

function toCanonicalDay(timestamp) {
  return Math.floor((timestamp + CANONICAL_TZ_OFFSET_MS) / DAY_MS);
}

export function formatUptimeDays(now = new Date()) {
  const currentTimestamp = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const elapsedDays = toCanonicalDay(currentTimestamp) - toCanonicalDay(LAUNCH_DAY_UTC_MS) + 1;
  return `${Math.max(1, elapsedDays)}d`;
}
