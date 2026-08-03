import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Cohort, Profile } from "@/lib/auth/types";
import { evaluateCourseAccess, type CourseAccessDecision } from "@/lib/access/rules";
import type { CourseScheduleDTO } from "@/lib/domain/exams";

export async function getCourseAccess(
  supabase: SupabaseClient,
  profile: Profile,
  cohort: Cohort | null,
  schedule: CourseScheduleDTO
): Promise<CourseAccessDecision> {
  if (profile.role === "admin") return { allowed: true, source: "admin" };

  const hasCohort = Boolean(cohort && profile.cohort_id === cohort.id);
  const expectedLevel = cohort?.level === "100-level" ? "100 Level" : "200 Level";
  const sameLevel = hasCohort && schedule.level === expectedLevel;
  const sameOffering = Boolean(
    cohort &&
      schedule.session === cohort.academic_session &&
      schedule.semester === cohort.semester
  );
  const { data: entitlement } = await supabase
    .from("premium_entitlements")
    .select("id")
    .eq("user_id", profile.id)
    .is("revoked_at", null)
    .limit(1)
    .maybeSingle();

  if (entitlement) {
    return evaluateCourseAccess({
      authenticated: true,
      onboardingComplete: Boolean(profile.onboarding_completed_at),
      accountActive: profile.account_status === "active",
      admin: false,
      sameLevel,
      sameOffering,
      freeAssignment: false,
      premiumEntitlement: true
    });
  }

  if (!sameLevel || !sameOffering) {
    return evaluateCourseAccess({
      authenticated: true,
      onboardingComplete: Boolean(profile.onboarding_completed_at),
      accountActive: profile.account_status === "active",
      admin: false,
      sameLevel,
      sameOffering,
      freeAssignment: false,
      premiumEntitlement: false
    });
  }

  if (!cohort) return { allowed: false, reason: "wrong_level" };

  const { data: allocation } = await supabase
    .from("free_exam_allocations")
    .select("id")
    .eq("user_id", profile.id)
    .eq("cohort_id", cohort.id)
    .eq("course_slug", schedule.slug)
    .eq("academic_session", schedule.session)
    .eq("semester", schedule.semester)
    .maybeSingle();

  return evaluateCourseAccess({
    authenticated: true,
    onboardingComplete: Boolean(profile.onboarding_completed_at),
    accountActive: profile.account_status === "active",
    admin: false,
    sameLevel,
    sameOffering,
    freeAssignment: Boolean(allocation),
    premiumEntitlement: false
  });
}
