import type { FreeAssignmentCandidate } from "@/lib/access/free-assignments";

export const onboardingAllocationFields = [
  "course_slug",
  "course_code",
  "course_title",
  "level",
  "academic_session",
  "semester",
  "assignment_position",
  "next_sitting_at"
] as const;

export type OnboardingAllocationPayload = {
  course_slug: string;
  course_code: string;
  course_title: string;
  level: "100-level" | "200-level";
  academic_session: string;
  semester: string;
  assignment_position: 1 | 2;
  next_sitting_at: string;
};

export type CompleteOnboardingRpcArgs = {
  p_user_id: string;
  p_cohort_id: string;
  p_allocations: OnboardingAllocationPayload[];
};

export function buildOnboardingAllocationPayload(
  assignments: FreeAssignmentCandidate[]
): OnboardingAllocationPayload[] {
  return assignments.map((assignment) => {
    assertIsoTimestamp(assignment.nextSittingAt);

    return {
      course_slug: assignment.courseSlug,
      course_code: assignment.courseCode,
      course_title: assignment.courseTitle,
      level: assignment.level,
      academic_session: assignment.academicSession,
      semester: assignment.semester,
      assignment_position: assignment.assignmentPosition,
      next_sitting_at: assignment.nextSittingAt
    };
  });
}

export function buildCompleteOnboardingRpcArgs(
  userId: string,
  cohortId: string,
  allocations: OnboardingAllocationPayload[]
): CompleteOnboardingRpcArgs {
  return {
    p_user_id: userId,
    p_cohort_id: cohortId,
    p_allocations: allocations
  };
}

function assertIsoTimestamp(value: string) {
  const timestamp = new Date(value);
  if (!Number.isFinite(timestamp.getTime()) || timestamp.toISOString() !== value) {
    throw new Error("Invalid onboarding allocation timestamp.");
  }
}
