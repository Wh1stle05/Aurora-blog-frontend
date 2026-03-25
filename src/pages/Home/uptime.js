const DAY_MS = 24 * 60 * 60 * 1000;
const CANONICAL_TZ_OFFSET_MS = 8 * 60 * 60 * 1000;
const DEFAULT_LAUNCH_DAY_UTC_MS = Date.UTC(2026, 2, 21, 16, 0, 0);

function toCanonicalDay(timestamp) {
  return Math.floor((timestamp + CANONICAL_TZ_OFFSET_MS) / DAY_MS);
}

export function resolveLaunchDayUtcMs(rawValue = import.meta.env.VITE_SITE_LAUNCH_DATE) {
  if (typeof rawValue !== 'string' || !rawValue.trim()) {
    return DEFAULT_LAUNCH_DAY_UTC_MS;
  }

  const normalized = `${rawValue.trim()}T00:00:00+08:00`;
  const parsed = new Date(normalized).getTime();

  return Number.isFinite(parsed) ? parsed : DEFAULT_LAUNCH_DAY_UTC_MS;
}

export function formatUptimeDays(now = new Date(), launchDayUtcMs = resolveLaunchDayUtcMs()) {
  const currentTimestamp = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const elapsedDays = toCanonicalDay(currentTimestamp) - toCanonicalDay(launchDayUtcMs) + 1;
  return `${Math.max(1, elapsedDays)}d`;
}
