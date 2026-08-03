import { getSafeNextPath } from "@/lib/auth/safe-next";
import {
  defaultLevelKey,
  isLevelKey,
  type LevelKey
} from "@/lib/domain/exams";

const knownStandaloneRoutes = new Set(["/account", "/admin", "/payment/return", "/rep"]);

export function getOnboardingContinuePath(
  value: string | null | undefined,
  selectedLevel: LevelKey
) {
  const safeNext = getSafeNextPath(value);
  const fallback = levelHomePath(selectedLevel);
  const parsed = new URL(safeNext, "https://local.invalid");
  const requestedLevel = parsed.searchParams.get("level");
  const level = isLevelKey(requestedLevel ?? undefined) ? requestedLevel : selectedLevel;

  if (parsed.pathname === "/") {
    return requestedLevel && isLevelKey(requestedLevel)
      ? `/?level=${requestedLevel}`
      : fallback;
  }

  const dateMatch = parsed.pathname.match(/^\/date\/(\d{4}-\d{2}-\d{2})$/);
  if (dateMatch) {
    return isValidCalendarDate(dateMatch[1])
      ? `/date/${dateMatch[1]}?level=${level}`
      : fallback;
  }

  if (/^\/exam\/[a-z0-9-]+$/.test(parsed.pathname)) {
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  }

  if (knownStandaloneRoutes.has(parsed.pathname)) {
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  }

  return fallback;
}

function levelHomePath(level: LevelKey) {
  return level === defaultLevelKey ? "/" : `/?level=${level}`;
}

function isValidCalendarDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
