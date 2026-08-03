import { FounderMessage } from "@/components/onboarding/founder-message";
import { PageShell } from "@/components/layout/page-shell";
import { formatPlanPrice, getFirstName } from "@/lib/content/funnel-copy";
import { getOnboardingContinuePath } from "@/lib/auth/onboarding-next";
import { getSafeNextPath } from "@/lib/auth/safe-next";
import { requireViewer } from "@/lib/auth/session";
import { defaultLevelKey } from "@/lib/domain/exams";

type FounderWelcomePageProps = {
  searchParams: Promise<{ next?: string }>;
};

export const dynamic = "force-dynamic";

export default async function FounderWelcomePage({ searchParams }: FounderWelcomePageProps) {
  const params = await searchParams;
  const requestedNextPath = getSafeNextPath(params.next);
  const viewer = await requireViewer(
    `/onboarding/welcome?next=${encodeURIComponent(requestedNextPath)}`
  );
  const nextPath = getOnboardingContinuePath(
    requestedNextPath,
    viewer.cohort?.level ?? defaultLevelKey
  );
  const { data: premiumPlan } = viewer.cohort
    ? await viewer.supabase
        .from("premium_plans")
        .select("amount_minor, currency")
        .eq("cohort_id", viewer.cohort.id)
        .eq("status", "active")
        .maybeSingle()
    : { data: null };
  const price = formatPlanPrice(
    premiumPlan
      ? {
          amountMinor: Number(premiumPlan.amount_minor),
          currency: premiumPlan.currency
        }
      : null
  ) ?? "₦1,500";

  return (
    <PageShell className="sm:pt-8">
      <FounderMessage
        name={getFirstName(viewer.profile.full_name)}
        price={price}
        nextHref={nextPath}
      />
    </PageShell>
  );
}
