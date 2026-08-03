"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { selectFreeExamAssignments } from "@/lib/access/free-assignments";
import { requireAdmin } from "@/lib/auth/session";
import type { LevelKey } from "@/lib/domain/exams";
import { verifyAndFinalizePayment } from "@/lib/payments/finalize";
import { listExamsByLevel } from "@/lib/repositories/exams";
import { createAdminClient } from "@/lib/supabase/admin";

function required(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) throw new Error(`${key} is required.`);
  return value;
}

async function runAdminMutation(operation: (actorId: string) => Promise<void>) {
  const viewer = await requireAdmin();
  try {
    await operation(viewer.user.id);
    revalidatePath("/admin");
    revalidatePath("/account");
  } catch {
    redirect("/admin?error=operation_failed");
  }
}

export async function setAccountStatusAction(formData: FormData) {
  await runAdminMutation(async (actorId) => {
    const userId = required(formData, "user_id");
    const status = required(formData, "status");
    const reason = required(formData, "reason");
    const admin = createAdminClient();
    const { error } = await admin.rpc("admin_set_account_status", {
      p_actor_user_id: actorId,
      p_user_id: userId,
      p_status: status,
      p_reason: reason
    });
    if (error) throw error;
  });
}

export async function correctLevelAction(formData: FormData) {
  await runAdminMutation(async (actorId) => {
    const admin = createAdminClient();
    const { error } = await admin.rpc("admin_correct_level", {
      p_actor_user_id: actorId,
      p_user_id: required(formData, "user_id"),
      p_cohort_id: required(formData, "cohort_id"),
      p_reason: required(formData, "reason")
    });
    if (error) throw error;
  });
}

export async function correctFreeAllocationsAction(formData: FormData) {
  await runAdminMutation(async (actorId) => {
    const userId = required(formData, "user_id");
    const reason = required(formData, "reason");
    const admin = createAdminClient();
    const [{ data: userData }, { data: profile }] = await Promise.all([
      admin.auth.admin.getUserById(userId),
      admin.from("profiles").select("cohort_id").eq("id", userId).single()
    ]);
    if (!userData.user?.created_at || !profile?.cohort_id) throw new Error("User is not onboarded.");

    const { data: cohort } = await admin
      .from("cohorts")
      .select("id, level")
      .eq("id", profile.cohort_id)
      .single();
    if (!cohort) throw new Error("Cohort missing.");

    const level = cohort.level as LevelKey;
    const schedules = await listExamsByLevel(level);
    const allocations = selectFreeExamAssignments(
      schedules,
      userData.user.created_at,
      level
    ).map((item) => ({
      course_slug: item.courseSlug,
      course_code: item.courseCode,
      course_title: item.courseTitle,
      assignment_position: item.assignmentPosition,
      next_sitting_at: item.nextSittingAt
    }));

    const { error } = await admin.rpc("admin_replace_free_allocations", {
      p_actor_user_id: actorId,
      p_user_id: userId,
      p_cohort_id: cohort.id,
      p_reason: reason,
      p_allocations: allocations
    });
    if (error) throw error;
  });
}

export async function setManualEntitlementAction(formData: FormData) {
  await runAdminMutation(async (actorId) => {
    const admin = createAdminClient();
    const { error } = await admin.rpc("admin_set_manual_entitlement", {
      p_actor_user_id: actorId,
      p_user_id: required(formData, "user_id"),
      p_cohort_id: required(formData, "cohort_id"),
      p_grant: required(formData, "operation") === "grant",
      p_reason: required(formData, "reason")
    });
    if (error) throw error;
  });
}

export async function promoteAdminAction(formData: FormData) {
  await runAdminMutation(async (actorId) => {
    const admin = createAdminClient();
    const { error } = await admin.rpc("admin_promote_user", {
      p_actor_user_id: actorId,
      p_user_id: required(formData, "user_id"),
      p_reason: required(formData, "reason")
    });
    if (error) throw error;
  });
}

export async function assignCourseRepAction(formData: FormData) {
  await runAdminMutation(async (actorId) => {
    try {
      const percentage = Number(required(formData, "commission_percentage"));
      if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
        throw new Error("Invalid commission percentage.");
      }

      const userId = required(formData, "user_id");
      const admin = createAdminClient();
      const { data: profile, error: profileError } = await admin
        .from("profiles")
        .select("cohort_id")
        .eq("id", userId)
        .single();
      if (profileError || !profile?.cohort_id) {
        throw profileError ?? new Error("The selected user has not completed onboarding.");
      }

      const { data: cohort, error: cohortError } = await admin
        .from("cohorts")
        .select("id")
        .eq("id", profile.cohort_id)
        .eq("status", "active")
        .single();
      if (cohortError || !cohort) {
        throw cohortError ?? new Error("The selected user's cohort is not active.");
      }

      const { error } = await admin.rpc("assign_course_rep", {
        p_actor_user_id: actorId,
        p_user_id: userId,
        p_cohort_id: cohort.id,
        p_commission_bps: Math.round(percentage * 100)
      });
      if (error) throw error;
    } catch (error) {
      logCourseRepAssignmentError(error);
      throw error;
    }
  });
}

export async function removeCourseRepAction(formData: FormData) {
  await runAdminMutation(async (actorId) => {
    const admin = createAdminClient();
    const { error } = await admin.rpc("remove_course_rep", {
      p_actor_user_id: actorId,
      p_assignment_id: required(formData, "assignment_id"),
      p_reason: required(formData, "reason")
    });
    if (error) throw error;
  });
}

export async function setCommissionStatusAction(formData: FormData) {
  await runAdminMutation(async (actorId) => {
    const admin = createAdminClient();
    const { error } = await admin.rpc("admin_set_commission_status", {
      p_actor_user_id: actorId,
      p_commission_id: required(formData, "commission_id"),
      p_status: required(formData, "status"),
      p_reason: String(formData.get("reason") ?? "") || null
    });
    if (error) throw error;
  });
}

export async function reconcilePaymentAction(formData: FormData) {
  await runAdminMutation(async () => {
    await verifyAndFinalizePayment(required(formData, "merchant_reference"));
  });
}

function logCourseRepAssignmentError(error: unknown) {
  const candidate = error && typeof error === "object"
    ? error as Record<string, unknown>
    : null;
  const field = (key: string) =>
    typeof candidate?.[key] === "string" ? candidate[key] : null;

  console.error("Course representative assignment failed", {
    code: field("code"),
    message: field("message") ?? (error instanceof Error ? error.message : "Unknown error"),
    details: field("details"),
    hint: field("hint")
  });
}
