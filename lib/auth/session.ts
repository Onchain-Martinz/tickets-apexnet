import "server-only";

import { redirect } from "next/navigation";

import { getSafeNextPath } from "@/lib/auth/safe-next";
import type { Cohort, Profile } from "@/lib/auth/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function getViewer() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, department, cohort_id, role, account_status, onboarding_completed_at")
    .eq("id", data.user.id)
    .maybeSingle();

  return {
    supabase,
    user: data.user,
    profile: (profile as Profile | null) ?? null
  };
}

export async function requireViewer(nextPath: string, requireOnboarding = true) {
  const safeNext = getSafeNextPath(nextPath);
  const viewer = await getViewer();

  if (!viewer) {
    redirect(`/auth/sign-in?next=${encodeURIComponent(safeNext)}`);
  }

  if (!viewer.profile) {
    redirect(`/auth/sign-in?error=profile_missing&next=${encodeURIComponent(safeNext)}`);
  }

  if (viewer.profile.account_status === "suspended") {
    redirect("/account/suspended");
  }

  if (requireOnboarding && !viewer.profile.onboarding_completed_at) {
    redirect(`/onboarding?next=${encodeURIComponent(safeNext)}`);
  }

  let cohort: Cohort | null = null;
  if (viewer.profile.cohort_id) {
    const { data } = await viewer.supabase
      .from("cohorts")
      .select("id, department, level, academic_session, semester, status")
      .eq("id", viewer.profile.cohort_id)
      .maybeSingle();
    cohort = (data as Cohort | null) ?? null;
  }

  return { ...viewer, profile: viewer.profile, cohort };
}

export async function requireAdmin(nextPath = "/admin") {
  const viewer = await requireViewer(nextPath);
  if (viewer.profile.role !== "admin") redirect("/");
  return viewer;
}

export async function requireCourseRep(nextPath = "/rep") {
  const viewer = await requireViewer(nextPath);
  if (viewer.profile.role !== "course_rep" && viewer.profile.role !== "admin") {
    redirect("/");
  }
  return viewer;
}
