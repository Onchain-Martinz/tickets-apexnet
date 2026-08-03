"use server";

import { redirect } from "next/navigation";

import { getAppUrl } from "@/lib/auth/app-url";
import { getSafeNextPath } from "@/lib/auth/safe-next";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle(nextPath: string) {
  const safeNext = getSafeNextPath(nextPath);
  if (!isSupabaseConfigured()) {
    redirect(`/auth/sign-in?error=not_configured&next=${encodeURIComponent(safeNext)}`);
  }

  const callbackUrl = new URL("/auth/callback", getAppUrl());
  callbackUrl.searchParams.set("next", safeNext);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
      queryParams: {
        access_type: "offline",
        prompt: "consent"
      }
    }
  });

  if (error || !data.url) {
    redirect(`/auth/sign-in?error=oauth_start_failed&next=${encodeURIComponent(safeNext)}`);
  }

  redirect(data.url);
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
