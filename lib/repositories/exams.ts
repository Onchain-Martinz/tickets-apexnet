import { examRecords } from "@/lib/data/exams";
import {
  CourseDetailDTO,
  CourseScheduleDTO,
  LevelKey,
  UpcomingExamDTO,
  levelOptions
} from "@/lib/domain/exams";
import { mapExamRecordToDetail, mapExamRecordToSchedule } from "@/lib/mappers/exams";
import { compareSittings, isSittingUpcoming } from "@/lib/utils/dates";

const currentSession = "2025/2026";
const currentSemester = "Second Semester";

export async function listExamsByLevel(level: LevelKey): Promise<CourseScheduleDTO[]> {
  const selectedLevel = levelOptions.find((option) => option.key === level);
  if (!selectedLevel) return [];

  return examRecords
    .filter(
      (exam) =>
        exam.session === currentSession &&
        exam.semester === currentSemester &&
        exam.level === selectedLevel.level
    )
    .map(mapExamRecordToSchedule)
    .sort(compareSchedules);
}

export async function listExamsByDate(date: string, level: LevelKey) {
  const schedules = await listExamsByLevel(level);
  return schedules.filter((schedule) =>
    schedule.sittings.some((sitting) => sitting.date === date)
  );
}

export async function getExamBySlug(slug: string): Promise<CourseDetailDTO | null> {
  const exam = examRecords.find((record) => record.slug === slug);
  return exam ? mapExamRecordToDetail(exam) : null;
}

export async function getUpcomingExam(
  level: LevelKey,
  referenceDate = new Date()
): Promise<UpcomingExamDTO | null> {
  const schedules = await listExamsByLevel(level);
  const upcoming = schedules
    .flatMap((schedule) =>
      schedule.sittings.map((sitting) => ({ schedule, sitting }))
    )
    .filter(({ sitting }) => isSittingUpcoming(sitting, referenceDate))
    .sort((left, right) => compareSittings(left.sitting, right.sitting));

  return upcoming[0] ?? null;
}

function compareSchedules(left: CourseScheduleDTO, right: CourseScheduleDTO) {
  const leftSitting = left.sittings[0];
  const rightSitting = right.sittings[0];

  if (!leftSitting && !rightSitting) return left.courseCode.localeCompare(right.courseCode);
  if (!leftSitting) return 1;
  if (!rightSitting) return -1;
  return compareSittings(leftSitting, rightSitting);
}
