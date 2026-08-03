import { redirect } from "next/navigation";

import { completeOnboarding } from "@/app/onboarding/actions";
import { PageShell } from "@/components/layout/page-shell";
import { LevelSelection } from "@/components/onboarding/level-selection";
import { getSafeNextPath } from "@/lib/auth/safe-next";
import { requireViewer } from "@/lib/auth/session";

type OnboardingPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(params.next);
  const viewer = await requireViewer(nextPath, false);
  if (viewer.profile.onboarding_completed_at) redirect(nextPath);

  const action = completeOnboarding.bind(null, nextPath);
  const errorMessage = params.error
    ? params.error === "invalid_level"
      ? "Choose one of the available levels."
      : "Your level could not be saved. Please try again."
    : undefined;

  return (
    <PageShell className="sm:pt-10">
      <LevelSelection action={action} errorMessage={errorMessage} />
    </PageShell>
  );
}
