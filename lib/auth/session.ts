import "server-only";

import { redirect } from "next/navigation";

import { getSafeNextPath } from "@/lib/auth/safe-next";
import type { Profile } from "@/lib/auth/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function getViewer() {
  // In local development / test mode, allow local admin inspection when configured or auth is offline
  if (
    process.env.NODE_ENV !== "production" &&
    (process.env.ENABLE_LOCAL_ADMIN === "true" || process.env.ENABLE_TEST_PAYMENT_MODE === "true")
  ) {
    return {
      supabase: null as any,
      user: { id: "00000000-0000-0000-0000-000000000001", email: "martinzkizitto@gmail.com" } as any,
      profile: {
        id: "00000000-0000-0000-0000-000000000001",
        full_name: "Martinz (Organizer)",
        email: "martinzkizitto@gmail.com",
        role: "admin",
        account_status: "active"
      } as Profile
    };
  }

  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, department, role, account_status")
      .eq("id", data.user.id)
      .maybeSingle();

    return {
      supabase,
      user: data.user,
      profile: (profile as Profile | null) ?? null
    };
  } catch {
    return null;
  }
}

export async function requireViewer(nextPath: string) {
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

  return { ...viewer, profile: viewer.profile };
}

export async function requireAdmin(nextPath = "/admin") {
  const { requireAdminAuth } = await import("@/lib/auth/admin-auth");
  await requireAdminAuth(nextPath);
}
