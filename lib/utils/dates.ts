import { ExamSittingDTO } from "@/lib/domain/exams";

export type ParsedTimeRange = {
  startTime: string | null;
  endTime: string | null;
};

export function parseTimeRange(value: string | null): ParsedTimeRange {
  if (!value || /not specified/i.test(value)) {
    return { startTime: null, endTime: null };
  }

  const normalized = value.replace(/[–—]/g, "-").trim();
  const parts = normalized.split(/\s+-\s+/);

  return {
    startTime: parseClockTime(parts[0] ?? ""),
    endTime: parseClockTime(parts[1] ?? "")
  };
}

export function parseClockTime(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (/^noon$/i.test(normalized)) return "12:00";
  if (/^midnight$/i.test(normalized)) return "00:00";

  const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM|Noon|Midnight)$/i);
  if (!match) return null;

  const suffix = match[3].toLowerCase();
  let hour = Number(match[1]);
  const minute = Number(match[2] ?? "0");

  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;
  if (suffix === "noon") return hour === 12 && minute === 0 ? "12:00" : null;
  if (suffix === "midnight") return hour === 12 && minute === 0 ? "00:00" : null;
  if (suffix === "pm" && hour !== 12) hour += 12;
  if (suffix === "am" && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function getSittingDateTime(
  sitting: Pick<ExamSittingDTO, "date" | "startTime">
) {
  const date = parseExamDate(sitting.date);

  if (!sitting.startTime) {
    date.setHours(23, 59, 0, 0);
    return date;
  }

  const [hour, minute] = sitting.startTime.split(":").map(Number);
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function isSittingUpcoming(
  sitting: Pick<ExamSittingDTO, "date" | "startTime">,
  referenceDate = new Date()
) {
  return getSittingDateTime(sitting).getTime() >= referenceDate.getTime();
}

export function isSittingCompleted(
  sitting: Pick<ExamSittingDTO, "date" | "startTime">,
  referenceDate = new Date()
) {
  return !isSittingUpcoming(sitting, referenceDate);
}

export function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(parseExamDate(date));
}

export function formatDayMonth(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric"
  }).format(parseExamDate(date));
}

export function parseExamDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function compareSittings(left: ExamSittingDTO, right: ExamSittingDTO) {
  return getSittingDateTime(left).getTime() - getSittingDateTime(right).getTime();
}
