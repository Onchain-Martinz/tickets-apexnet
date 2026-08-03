"use server";

import { redirect } from "next/navigation";

import { selectFreeExamAssignments } from "@/lib/access/free-assignments";
import {
  buildCompleteOnboardingRpcArgs,
  buildOnboardingAllocationPayload
} from "@/lib/access/onboarding-payload";
import { getSafeNextPath } from "@/lib/auth/safe-next";
import { requireViewer } from "@/lib/auth/session";
import type { LevelKey } from "@/lib/domain/exams";
import { listExamsByLevel } from "@/lib/repositories/exams";
import { createAdminClient } from "@/lib/supabase/admin";

const allowedLevels = new Set<LevelKey>(["100-level", "200-level"]);

export async function completeOnboarding(nextPath: string, formData: FormData) {
  const safeNext = getSafeNextPath(nextPath);
  const viewer = await requireViewer(safeNext, false);

  if (viewer.profile.onboarding_completed_at) redirect(safeNext);

  const level = String(formData.get("level") ?? "") as LevelKey;
  if (!allowedLevels.has(level)) {
    redirect(`/onboarding?error=invalid_level&next=${encodeURIComponent(safeNext)}`);
  }

  try {
    const admin = createAdminClient();
    const { data: authData, error: authError } = await admin.auth.admin.getUserById(
      viewer.user.id
    );
    if (authError || !authData.user?.created_at) throw authError ?? new Error("User missing");
    if (authData.user.id !== viewer.user.id) throw new Error("Authenticated user mismatch.");

    const { data: cohort, error: cohortError } = await admin
      .from("cohorts")
      .select("id, level, academic_session, semester")
      .eq("department", "Psychology")
      .eq("level", level)
      .eq("academic_session", "2025/2026")
      .eq("semester", "Second Semester")
      .eq("status", "active")
      .single();
    if (cohortError || !cohort) throw cohortError ?? new Error("Cohort missing");
    if (
      cohort.level !== level ||
      cohort.academic_session !== "2025/2026" ||
      cohort.semester !== "Second Semester"
    ) {
      throw new Error("Cohort does not match the selected offering.");
    }

    const schedules = await listExamsByLevel(level);
    const assignments = buildOnboardingAllocationPayload(
      selectFreeExamAssignments(schedules, authData.user.created_at, level)
    );

    const { error } = await admin.rpc(
      "complete_onboarding",
      buildCompleteOnboardingRpcArgs(viewer.user.id, cohort.id, assignments)
    );
    if (error) throw error;
  } catch (error) {
    logOnboardingError(error);
    redirect(`/onboarding?error=save_failed&next=${encodeURIComponent(safeNext)}`);
  }

  redirect(`/onboarding/welcome?next=${encodeURIComponent(safeNext)}`);
}

function logOnboardingError(error: unknown) {
  const candidate = error && typeof error === "object"
    ? error as Record<string, unknown>
    : null;

  console.error("Supabase onboarding failed", {
    code: stringField(candidate?.code),
    message: stringField(candidate?.message) ?? (error instanceof Error ? error.message : "Unknown onboarding error"),
    details: stringField(candidate?.details),
    hint: stringField(candidate?.hint)
  });
}

function stringField(value: unknown) {
  return typeof value === "string" ? value : null;
}
