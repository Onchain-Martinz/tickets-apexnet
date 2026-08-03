import Link from "next/link";

import { PaymentStatusRefresh } from "@/components/payments/payment-status-refresh";
import { PaymentRetryButton } from "@/components/payments/payment-retry-button";
import { WhatsAppSupportLink } from "@/components/support/whatsapp-support-link";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireViewer } from "@/lib/auth/session";
import { funnelCopy, getFirstName } from "@/lib/content/funnel-copy";

type PaymentReturnPageProps = {
  searchParams: Promise<{ reference?: string }>;
};

export const dynamic = "force-dynamic";

export default async function PaymentReturnPage({ searchParams }: PaymentReturnPageProps) {
  const { reference } = await searchParams;
  const nextPath = reference
    ? `/payment/return?reference=${encodeURIComponent(reference)}`
    : "/payment/return";
  const viewer = await requireViewer(nextPath);

  const readPayment = () => reference
    ? viewer.supabase
        .from("payments")
        .select("merchant_reference, status, initiated_at, verified_at")
        .eq("user_id", viewer.user.id)
        .eq("merchant_reference", reference)
        .maybeSingle()
    : Promise.resolve({ data: null });

  const { data: payment } = await readPayment();

  const status = payment?.status ?? "pending";
  const pending = status === "pending";
  const firstName = getFirstName(viewer.profile.full_name);

  return (
    <PageShell>
      <div className="mx-auto max-w-md">
        <PaymentStatusRefresh active={pending} />
        <Card>
          <CardHeader>
            <CardTitle>
              {status === "successful"
                ? funnelCopy.paymentSuccess.title(firstName)
                : status === "failed"
                  ? "Payment was not completed"
                  : "Confirming your payment"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "successful" ? (
              <div className="space-y-2 text-sm leading-6 text-muted-foreground">
                {funnelCopy.paymentSuccess.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                {status === "failed"
                  ? "No access was granted. You can return to a locked course and try again."
                  : "This page cannot unlock access by itself. It will update after Kora is verified by the server."}
              </p>
            )}
            <Button asChild>
              <Link href="/">{status === "successful" ? "Start preparing" : "Return to calendar"}</Link>
            </Button>
            {status === "failed" || pending ? <PaymentRetryButton /> : null}
            <WhatsAppSupportLink />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
