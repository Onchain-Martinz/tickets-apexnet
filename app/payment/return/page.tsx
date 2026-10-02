import Link from "next/link";
import { Loader2, XCircle, ArrowLeft, RefreshCw } from "lucide-react";

import { PaymentStatusRefresh } from "@/components/payments/payment-status-refresh";
import { TicketPassCard } from "@/components/tickets/ticket-pass-card";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isKoraConfigured } from "@/lib/payments/kora";
import { verifyAndFinalizePayment } from "@/lib/payments/finalize";

type PaymentReturnPageProps = {
  searchParams: Promise<{ reference?: string | string[] }>;
};

export const dynamic = "force-dynamic";

function sanitizeReference(raw: unknown): string {
  if (Array.isArray(raw)) {
    return sanitizeReference(raw[0]);
  }
  if (typeof raw !== "string") return "";
  let clean = raw.trim();
  if (clean.includes(",")) {
    clean = clean.split(",")[0].trim();
  }
  // Handle accidental duplication if reference prefix is repeated (e.g. PARTY-...PARTY-...)
  if (clean.startsWith("PARTY-") && clean.indexOf("PARTY-", 6) > 0) {
    clean = clean.slice(0, clean.indexOf("PARTY-", 6));
  }
  return clean;
}

export default async function PaymentReturnPage({ searchParams }: PaymentReturnPageProps) {
  const params = await searchParams;
  const reference = sanitizeReference(params.reference);

  if (!reference || !isSupabaseConfigured()) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md space-y-4 pt-8">
          <Card className="border-white/10 bg-zinc-950/80 shadow-2xl backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Ticket Lookup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-400">
                No payment reference was provided.
              </p>
              <Button asChild className="w-full bg-violet-600 hover:bg-violet-500 text-white">
                <Link href="/">Return to Event Page</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageShell>
    );
  }

  const admin = createAdminClient();
  let { data: payment } = await admin
    .from("payments")
    .select("id, merchant_reference, provider_reference, buyer_name, buyer_department, ticket_number, amount_minor, currency, status, initiated_at, verified_at")
    .eq("merchant_reference", reference)
    .maybeSingle();

  if (!payment) {
    const { data: byProvider } = await admin
      .from("payments")
      .select("id, merchant_reference, provider_reference, buyer_name, buyer_department, ticket_number, amount_minor, currency, status, initiated_at, verified_at")
      .eq("provider_reference", reference)
      .maybeSingle();
    payment = byProvider;
  }

  let status = payment?.status ?? "pending";

  // Authoritative Server Fallback: If pending, query Korapay directly and finalize if verified
  if (status === "pending" && isKoraConfigured()) {
    try {
      const finalized = await verifyAndFinalizePayment(reference);
      if (finalized) {
        payment = finalized;
        status = finalized.status;
      }
    } catch {
      // Payment verification may still be in progress or pending at provider.
    }
  }

  const pending = status === "pending";

  return (
    <PageShell>
      <div className="mx-auto max-w-md pt-4 sm:pt-8">
        <PaymentStatusRefresh active={pending} />

        {status === "successful" && payment ? (
          <TicketPassCard
            buyerName={payment.buyer_name || "Guest"}
            department={payment.buyer_department || "General"}
            ticketNumber={
              payment.ticket_number ||
              `TKT-${payment.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`
            }
            verifiedAt={payment.verified_at}
            merchantReference={payment.merchant_reference}
            amountMinor={Number(payment.amount_minor)}
          />
        ) : status === "failed" ? (
          <Card className="border-red-500/30 bg-zinc-950/80 shadow-2xl backdrop-blur-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-red-500/15 border border-red-500/30 text-red-400">
                <XCircle className="size-6" />
              </div>
              <CardTitle className="text-xl font-bold text-white">Payment Not Completed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-sm text-zinc-400">
                Your payment was not completed or was cancelled. No ticket has been issued.
              </p>
              <Button asChild className="w-full gap-2 bg-violet-600 hover:bg-violet-500 text-white">
                <Link href="/#get-ticket">
                  <ArrowLeft className="size-4" />
                  Try Again
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-white/10 bg-zinc-950/80 shadow-2xl backdrop-blur-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400">
                <Loader2 className="size-6 animate-spin" />
              </div>
              <CardTitle className="text-xl font-bold text-white">Payment successful 🎉</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-sm leading-relaxed text-zinc-300">
                Your payment has been received. We&apos;re confirming your ticket now...
              </p>
              <div className="rounded-xl bg-white/5 border border-white/5 p-3 font-mono text-xs text-zinc-400 break-all">
                Ref: {reference}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
