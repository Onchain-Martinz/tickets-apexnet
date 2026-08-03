import { NextResponse } from "next/server";

import { getAppUrl } from "@/lib/auth/app-url";
import { getSafeNextPath } from "@/lib/auth/safe-next";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const appUrl = getAppUrl();
  const code = url.searchParams.get("code");
  const nextPath = getSafeNextPath(url.searchParams.get("next"));
  const oauthError = url.searchParams.get("error");

  if (oauthError || !code) {
    const reason = oauthError ? "oauth_cancelled" : "oauth_callback_failed";
    return NextResponse.redirect(
      new URL(`/auth/sign-in?error=${reason}&next=${encodeURIComponent(nextPath)}`, appUrl)
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;

    const { data } = await supabase.auth.getUser();
    if (!data.user) throw new Error("Authenticated user missing after OAuth callback.");

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed_at")
      .eq("id", data.user.id)
      .maybeSingle();

    const destination = profile?.onboarding_completed_at
      ? nextPath
      : `/onboarding?next=${encodeURIComponent(nextPath)}`;
    return NextResponse.redirect(new URL(destination, appUrl));
  } catch {
    return NextResponse.redirect(
      new URL(
        `/auth/sign-in?error=oauth_callback_failed&next=${encodeURIComponent(nextPath)}`,
        appUrl
      )
    );
  }
}
