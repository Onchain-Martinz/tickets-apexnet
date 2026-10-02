import Link from "next/link";
import { ArrowLeft, Ticket, DollarSign, Wallet, RefreshCw } from "lucide-react";

import { reconcilePaymentAction, logoutAdminAction } from "@/app/admin/actions";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EVENT_CONFIG } from "@/lib/config/event";
import { requireAdminAuth } from "@/lib/auth/admin-auth";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

type AdminPageProps = {
  searchParams: Promise<{ q?: string; error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdmin("/admin");
  const { q = "", error } = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("payments")
    .select("id, merchant_reference, provider_reference, buyer_name, buyer_department, ticket_number, amount_minor, organizer_proceeds_minor, currency, status, created_at, verified_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const safeQuery = q.trim().replace(/[,().%]/g, "");
  if (safeQuery) {
    query = query.or(
      `buyer_name.ilike.%${safeQuery}%,buyer_department.ilike.%${safeQuery}%,ticket_number.ilike.%${safeQuery}%,merchant_reference.ilike.%${safeQuery}%`
    );
  }

  const { data: payments = [] } = (await query) as { data: any[] | null };
  const allPayments: any[] = payments ?? [];

  // Summary Metrics
  const successfulPayments = allPayments.filter((p: any) => p.status === "successful");
  const successfulTicketsCount = successfulPayments.length;
  const totalCustomerPaymentsMinor = successfulPayments.reduce(
    (sum: number, p: any) => sum + Number(p.amount_minor || 0),
    0
  );
  // Organizer payout: successful tickets × ₦7,100
  const organizerPayoutMinor = successfulTicketsCount * EVENT_CONFIG.organizerProceedsMinor;

  const money = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  });

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Navigation & Title */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/" className="gap-1.5 text-xs text-muted-foreground">
                <ArrowLeft className="size-3.5" />
                Live Page
              </Link>
            </Button>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {EVENT_CONFIG.name} — Organizer Dashboard
            </h1>
          </div>
          <form action={logoutAdminAction}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>

        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            Operation failed. If reconciling a payment, please ensure Korapay has verified the transaction.
          </div>
        ) : null}

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-border/80 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Successful Tickets
              </CardTitle>
              <Ticket className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-foreground sm:text-3xl">
                {successfulTicketsCount}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Confirmed attendees</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Customer Payments
              </CardTitle>
              <DollarSign className="size-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-foreground sm:text-3xl">
                {money.format(totalCustomerPaymentsMinor / 100)}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Gross received @ {money.format(EVENT_CONFIG.ticketPriceMinor / 100)} / ticket
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-primary/5 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-primary">
                Organizer Payout
              </CardTitle>
              <Wallet className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-primary sm:text-3xl">
                {money.format(organizerPayoutMinor / 100)}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Settled @ {money.format(EVENT_CONFIG.organizerProceedsMinor / 100)} / ticket
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table Card */}
        <Card className="border-border/80 shadow-md">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-bold">Attendee & Ticket Transactions</CardTitle>
              <p className="text-xs text-muted-foreground">
                Real-time records of all ticket orders
              </p>
            </div>
            <form className="flex gap-2">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search name, dept, or ticket..."
                className="h-9 w-full sm:w-64 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button type="submit" size="sm" variant="secondary">
                Search
              </Button>
            </form>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-y border-border bg-muted/40 font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Ticket / Ref</th>
                    <th className="px-4 py-3">Name / Nickname</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Amount Paid</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date / Time</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {allPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-muted-foreground">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    allPayments.map((payment) => {
                      const isSuccess = payment.status === "successful";
                      const isPending = payment.status === "pending";
                      const dateStr = payment.verified_at || payment.created_at;

                      return (
                        <tr key={payment.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-mono font-medium text-foreground">
                            {payment.ticket_number || payment.merchant_reference}
                          </td>
                          <td className="px-4 py-3 font-medium text-foreground">
                            {payment.buyer_name || "—"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {payment.buyer_department || "—"}
                          </td>
                          <td className="px-4 py-3 font-semibold text-foreground">
                            {money.format(Number(payment.amount_minor) / 100)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={[
                                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                                isSuccess
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : isPending
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                    : "bg-destructive/10 text-destructive"
                              ].join(" ")}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                            {dateStr
                              ? new Date(dateStr).toLocaleString("en-NG", {
                                  dateStyle: "short",
                                  timeStyle: "short"
                                })
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {isPending ? (
                              <form action={reconcilePaymentAction} className="inline">
                                <input
                                  type="hidden"
                                  name="merchant_reference"
                                  value={payment.merchant_reference}
                                />
                                <Button
                                  type="submit"
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 gap-1 px-2 text-[11px]"
                                >
                                  <RefreshCw className="size-3" />
                                  Re-query
                                </Button>
                              </form>
                            ) : (
                              <span className="text-muted-foreground/50 text-[11px]">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
