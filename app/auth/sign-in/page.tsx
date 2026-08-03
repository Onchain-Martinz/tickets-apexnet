import { redirect } from "next/navigation";

import { signInWithGoogle } from "@/app/auth/actions";
import { PageShell } from "@/components/layout/page-shell";
import { WelcomeScreen } from "@/components/onboarding/welcome-screen";
import { getSafeNextPath } from "@/lib/auth/safe-next";
import { getViewer } from "@/lib/auth/session";

type SignInPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  oauth_cancelled: "Google sign-in was cancelled. You can try again when ready.",
  oauth_callback_failed: "Google sign-in could not be completed. Please try again.",
  oauth_start_failed: "Google sign-in is temporarily unavailable. Please try again.",
  profile_missing: "Your account profile could not be loaded. Please contact support.",
  not_configured: "Authentication has not been configured for this deployment yet."
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(params.next);
  const viewer = await getViewer();

  if (viewer?.profile?.onboarding_completed_at) redirect(nextPath);
  if (viewer?.profile) redirect(`/onboarding?next=${encodeURIComponent(nextPath)}`);

  const action = signInWithGoogle.bind(null, nextPath);

  return (
    <PageShell className="sm:pt-10">
      <WelcomeScreen
        action={action}
        errorMessage={params.error ? errorMessages[params.error] ?? "Sign-in could not be completed." : undefined}
      />
    </PageShell>
  );
}
