import type { CourseScheduleDTO, ExamSittingDTO } from "@/lib/domain/exams";

export type FreeAssignmentCandidate = {
  courseSlug: string;
  courseCode: string;
  courseTitle: string;
  level: "100-level" | "200-level";
  academicSession: string;
  semester: string;
  assignmentPosition: 1 | 2;
  nextSittingAt: string;
};

export function selectFreeExamAssignments(
  schedules: CourseScheduleDTO[],
  accountCreatedAt: string,
  level: "100-level" | "200-level"
): FreeAssignmentCandidate[] {
  const anchor = new Date(accountCreatedAt).getTime();
  if (!Number.isFinite(anchor)) throw new Error("Invalid account creation timestamp.");

  return schedules
    .map((schedule) => {
      const nextSitting = schedule.sittings
        .map((sitting) => ({ sitting, timestamp: getLagosSittingTimestamp(sitting) }))
        .filter(({ timestamp }) => timestamp > anchor)
        .sort((left, right) => left.timestamp - right.timestamp)[0];

      return nextSitting ? { schedule, ...nextSitting } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort(
      (left, right) =>
        left.timestamp - right.timestamp ||
        left.schedule.courseCode.localeCompare(right.schedule.courseCode)
    )
    .slice(0, 2)
    .map(({ schedule, sitting }, index) => ({
      courseSlug: schedule.slug,
      courseCode: schedule.courseCode,
      courseTitle: schedule.courseTitle,
      level,
      academicSession: schedule.session,
      semester: schedule.semester,
      assignmentPosition: (index + 1) as 1 | 2,
      nextSittingAt: new Date(getLagosSittingTimestamp(sitting)).toISOString()
    }));
}

export function getLagosSittingTimestamp(sitting: ExamSittingDTO) {
  const clock = sitting.startTime ?? "23:59";
  return new Date(`${sitting.date}T${clock}:00+01:00`).getTime();
}
