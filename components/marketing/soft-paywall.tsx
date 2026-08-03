import { FounderMessageCard } from "@/components/marketing/founder-message-card";
import { WhatsAppSupportLink } from "@/components/support/whatsapp-support-link";
import { Button } from "@/components/ui/button";
import { funnelCopy, paywallMessage } from "@/lib/content/funnel-copy";
import type { CourseScheduleDTO } from "@/lib/domain/exams";

type SoftPaywallProps = {
  schedule: CourseScheduleDTO;
  name: string;
  price: string | null;
  loading: boolean;
  error: string | null;
  onCheckout: () => void;
};

export function SoftPaywall({
  schedule,
  name,
  price,
  loading,
  error,
  onCheckout
}: SoftPaywallProps) {
  return (
    <div className="space-y-5">
      <section className="rounded-[1.5rem] border border-border/60 bg-card px-4 py-5 shadow-calm sm:px-6 sm:py-6">
        <p className="text-lg font-semibold text-foreground">{schedule.courseCode}</p>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
          {schedule.courseTitle}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {schedule.session} {schedule.semester} — {schedule.level}
        </p>
      </section>

      <FounderMessageCard title={funnelCopy.paywall.title(name)}>
        <div className="space-y-4 text-sm leading-6 text-muted-foreground sm:text-[15px] sm:leading-7">
          {price ? (
            paywallMessage(price).map((paragraph) => <p key={paragraph}>{paragraph}</p>)
          ) : (
            <p>Premium checkout is not currently available for this level.</p>
          )}
        </div>
        {error ? (
          <p className="mt-4 rounded-[0.9rem] border border-border bg-muted/40 p-3 text-sm text-foreground">
            {error}
          </p>
        ) : null}
        {price ? (
          <Button
            type="button"
            size="lg"
            className="mt-6 w-full sm:w-auto"
            onClick={onCheckout}
            disabled={loading}
          >
            {loading ? "Opening secure checkout…" : funnelCopy.paywall.button(price)}
          </Button>
        ) : null}
        <div className="mt-3">
          <WhatsAppSupportLink label="Need help? Chat with Martinz" />
        </div>
      </FounderMessageCard>
    </div>
  );
}
