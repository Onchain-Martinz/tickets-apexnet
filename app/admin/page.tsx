import Link from "next/link";

import {
  assignCourseRepAction,
  correctFreeAllocationsAction,
  correctLevelAction,
  promoteAdminAction,
  reconcilePaymentAction,
  removeCourseRepAction,
  setAccountStatusAction,
  setCommissionStatusAction,
  setManualEntitlementAction
} from "@/app/admin/actions";
import { BackLink } from "@/components/layout/back-link";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getVisitorOverview } from "@/lib/analytics/visitor-overview";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

type AdminPageProps = { searchParams: Promise<{ q?: string; error?: string }> };

export const dynamic = "force-dynamic";

type AdminOverview = {
  total_users: number;
  level_100_users: number;
  level_200_users: number;
  premium_users: number;
  verified_revenue_minor: number;
  pending_payments: number;
  active_course_reps: number;
  pending_commission_minor: number;
  paid_commission_minor: number;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const viewer = await requireAdmin();
  const { q = "", error } = await searchParams;
  const admin = createAdminClient();

  let usersQuery = admin
    .from("profiles")
    .select("id, full_name, email, cohort_id, role, account_status, onboarding_completed_at")
    .order("created_at", { ascending: false })
    .limit(50);
  const safeQuery = q.trim().replace(/[,().%]/g, "");
  if (safeQuery) usersQuery = usersQuery.or(`full_name.ilike.%${safeQuery}%,email.ilike.%${safeQuery}%`);

  const [usersResult, cohortsResult, entitlementsResult, allocationsResult, plansResult, paymentsResult, repsResult, commissionsResult, overviewResult, visitorOverview] =
    await Promise.all([
      usersQuery,
      admin.from("cohorts").select("id, level, academic_session, semester").eq("status", "active"),
      admin.from("premium_entitlements").select("id, user_id, cohort_id, source, revoked_at").is("revoked_at", null),
      admin.from("free_exam_allocations").select("id, user_id, course_code_snapshot, course_title_snapshot, assignment_position").order("assignment_position"),
      admin.from("premium_plans").select("id, cohort_id"),
      admin.from("payments").select("id, user_id, premium_plan_id, merchant_reference, amount_minor, currency, status, initiated_at, verified_at").order("created_at", { ascending: false }).limit(50),
      admin.from("course_rep_assignments").select("id, user_id, cohort_id, commission_bps, status, assigned_at").order("created_at", { ascending: false }),
      admin.from("commissions").select("id, course_rep_assignment_id, payment_id, sale_amount_minor, commission_amount_minor, status, created_at").order("created_at", { ascending: false }),
      admin.rpc("get_admin_overview", { p_actor_user_id: viewer.user.id }),
      getVisitorOverview()
    ]);

  const users = usersResult.data ?? [];
  const cohorts = cohortsResult.data ?? [];
  const entitlements = entitlementsResult.data ?? [];
  const allocations = allocationsResult.data ?? [];
  const plans = plansResult.data ?? [];
  const payments = paymentsResult.data ?? [];
  const reps = repsResult.data ?? [];
  const commissions = commissionsResult.data ?? [];
  const cohortById = new Map(cohorts.map((cohort) => [cohort.id, cohort]));
  const userById = new Map(users.map((user) => [user.id, user]));
  const planById = new Map(plans.map((plan) => [plan.id, plan]));
  const eligibleRepUsers = users.filter(
    (user) =>
      user.role !== "admin" &&
      Boolean(user.cohort_id && cohortById.has(user.cohort_id)) &&
      !reps.some(
        (assignment) =>
          assignment.cohort_id === user.cohort_id && assignment.status === "active"
      )
  );
  const money = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" });
  const overview = overviewResult.data as AdminOverview | null;
  const metrics = [
    ["Total users", overview?.total_users ?? 0],
    ["100 Level users", overview?.level_100_users ?? 0],
    ["200 Level users", overview?.level_200_users ?? 0],
    ["Premium users", overview?.premium_users ?? 0],
    ["Verified revenue", money.format(Number(overview?.verified_revenue_minor ?? 0) / 100)],
    ["Pending payments", overview?.pending_payments ?? 0],
    ["Active reps", overview?.active_course_reps ?? 0],
    ["Pending commission", money.format(Number(overview?.pending_commission_minor ?? 0) / 100)],
    ["Paid commission", money.format(Number(overview?.paid_commission_minor ?? 0) / 100)]
  ];

  return (
    <PageShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <BackLink href="/account">Back to account</BackLink>
          <Link href="/rep" className="text-xs font-medium text-muted-foreground">Rep view</Link>
        </div>
        <section>
          <h1 className="text-2xl font-semibold tracking-[-0.03em]">Admin dashboard</h1>
          {error ? <p className="mt-2 text-sm text-muted-foreground">The requested operation could not be completed.</p> : null}
        </section>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map(([label, value]) => (
            <Card key={String(label)}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></CardContent></Card>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Anonymous Visitors</CardTitle>
            <p className="text-xs leading-5 text-muted-foreground">
              Account conversion based on visitors recorded by Google Analytics.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                ["Visitors without accounts", visitorOverview?.anonymousVisitors ?? "—"],
                ["Registered users", visitorOverview?.registeredVisitors ?? "—"],
                [
                  "Conversion",
                  visitorOverview ? `${visitorOverview.conversionPercentage.toFixed(1)}%` : "—"
                ]
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-[1rem] border border-border bg-muted/35 p-4">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>
            {!visitorOverview ? (
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Visitor analytics is not configured or is temporarily unavailable.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>User management</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <form className="flex gap-2"><input name="q" defaultValue={q} placeholder="Search name or email" className="min-h-10 flex-1 rounded-full border border-input bg-background px-4 text-sm" /><Button size="sm">Search</Button></form>
            {users.map((user) => {
              const cohort = cohortById.get(user.cohort_id ?? "");
              const activeEntitlement = entitlements.find(
                (item) => item.user_id === user.id
              );
              const userAllocations = allocations.filter((item) => item.user_id === user.id);
              return (
                <details key={user.id} className="rounded-[1rem] border border-border p-3">
                  <summary className="cursor-pointer text-sm font-medium">{user.full_name || "Unnamed user"} — {user.email}</summary>
                  <div className="mt-3 space-y-3 text-xs text-muted-foreground">
                    <p>{cohort?.level ?? "Not onboarded"} · {user.role} · {user.account_status} · {activeEntitlement ? `Premium (${activeEntitlement.source})` : "Free only"}</p>
                    <p>Free courses: {userAllocations.length ? userAllocations.map((item) => item.course_code_snapshot).join(", ") : "None assigned"}</p>
                    <div className="grid gap-2 lg:grid-cols-2">
                      <form action={setAccountStatusAction} className="flex flex-wrap gap-2">
                        <input type="hidden" name="user_id" value={user.id} />
                        <input type="hidden" name="status" value={user.account_status === "active" ? "suspended" : "active"} />
                        <input name="reason" required placeholder="Reason" className="min-h-9 flex-1 rounded-full border bg-background px-3" />
                        <Button size="sm" variant="secondary">{user.account_status === "active" ? "Suspend" : "Reactivate"}</Button>
                      </form>
                      <form action={correctLevelAction} className="flex flex-wrap gap-2">
                        <input type="hidden" name="user_id" value={user.id} />
                        <select name="cohort_id" required className="min-h-9 rounded-full border bg-background px-3">{cohorts.map((item) => <option key={item.id} value={item.id}>{item.level}</option>)}</select>
                        <input name="reason" required placeholder="Correction reason" className="min-h-9 flex-1 rounded-full border bg-background px-3" />
                        <Button size="sm" variant="secondary">Correct level</Button>
                      </form>
                      <form action={correctFreeAllocationsAction} className="flex flex-wrap gap-2">
                        <input type="hidden" name="user_id" value={user.id} />
                        <input name="reason" required placeholder="Allocation correction reason" className="min-h-9 flex-1 rounded-full border bg-background px-3" />
                        <Button size="sm" variant="secondary">Recalculate original free slots</Button>
                      </form>
                      {user.cohort_id && (!activeEntitlement || activeEntitlement.source === "admin") ? <form action={setManualEntitlementAction} className="flex flex-wrap gap-2">
                        <input type="hidden" name="user_id" value={user.id} /><input type="hidden" name="cohort_id" value={activeEntitlement?.cohort_id ?? user.cohort_id} />
                        <input type="hidden" name="operation" value={activeEntitlement ? "revoke" : "grant"} />
                        <input name="reason" required placeholder="Entitlement reason" className="min-h-9 flex-1 rounded-full border bg-background px-3" />
                        <Button size="sm" variant="secondary">{activeEntitlement ? "Revoke manual access" : "Grant premium access"}</Button>
                      </form> : null}
                      {user.role !== "admin" ? <form action={promoteAdminAction} className="flex flex-wrap gap-2"><input type="hidden" name="user_id" value={user.id} /><input name="reason" required placeholder="Promotion reason" className="min-h-9 flex-1 rounded-full border bg-background px-3" /><Button size="sm" variant="secondary">Promote admin</Button></form> : null}
                    </div>
                  </div>
                </details>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Course representatives</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <form action={assignCourseRepAction} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(10rem,0.55fr)_auto] sm:items-end">
              <label className="grid gap-1 text-xs text-muted-foreground">
                Student and current level
                <select name="user_id" required className="min-h-10 rounded-full border bg-background px-3 text-sm text-foreground">
                  {eligibleRepUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name || user.email} · {cohortById.get(user.cohort_id!)?.level}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs text-muted-foreground">
                Commission percentage
                <input name="commission_percentage" type="number" min="0" max="100" step="0.01" defaultValue="50" required className="min-h-10 rounded-full border bg-background px-3 text-sm text-foreground" />
              </label>
              <Button disabled={!eligibleRepUsers.length}>Assign rep</Button>
            </form>
            {!eligibleRepUsers.length ? (
              <p className="text-xs leading-5 text-muted-foreground">
                No onboarded students are currently eligible for an unassigned active cohort.
              </p>
            ) : null}
            {reps.map((rep) => { const repCommissions = commissions.filter((item) => item.course_rep_assignment_id === rep.id && item.status !== "reversed"); return <div key={rep.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[0.9rem] border p-3 text-sm"><span>{userById.get(rep.user_id)?.full_name ?? rep.user_id} · {cohortById.get(rep.cohort_id)?.level} · {rep.commission_bps / 100}% · {rep.status} · {repCommissions.length} sales · {money.format(repCommissions.reduce((sum, item) => sum + Number(item.commission_amount_minor), 0) / 100)}</span>{rep.status === "active" ? <form action={removeCourseRepAction} className="flex gap-2"><input type="hidden" name="assignment_id" value={rep.id} /><input name="reason" required placeholder="Removal reason" className="min-h-9 rounded-full border bg-background px-3 text-xs" /><Button size="sm" variant="secondary">Remove</Button></form> : null}</div>; })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Payments and commissions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {payments.map((payment) => { const plan = planById.get(payment.premium_plan_id); return <div key={payment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[0.9rem] border p-3 text-xs"><span>{payment.merchant_reference} · {userById.get(payment.user_id)?.email ?? payment.user_id} · {cohortById.get(plan?.cohort_id ?? "")?.level ?? "Unknown cohort"} · {money.format(Number(payment.amount_minor) / 100)} · {payment.status} · initiated {new Date(payment.initiated_at).toLocaleString("en-NG")}{payment.verified_at ? ` · verified ${new Date(payment.verified_at).toLocaleString("en-NG")}` : ""}</span>{payment.status === "pending" ? <form action={reconcilePaymentAction}><input type="hidden" name="merchant_reference" value={payment.merchant_reference} /><Button size="sm" variant="secondary">Re-query Kora</Button></form> : null}</div>; })}
            {commissions.map((commission) => <div key={commission.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[0.9rem] border p-3 text-xs"><span>{money.format(Number(commission.commission_amount_minor) / 100)} · {commission.status}</span>{commission.status === "pending" ? <div className="flex gap-2"><form action={setCommissionStatusAction}><input type="hidden" name="commission_id" value={commission.id} /><input type="hidden" name="status" value="paid" /><Button size="sm" variant="secondary">Mark paid</Button></form><form action={setCommissionStatusAction} className="flex gap-2"><input type="hidden" name="commission_id" value={commission.id} /><input type="hidden" name="status" value="reversed" /><input name="reason" required placeholder="Reason" className="min-h-9 rounded-full border bg-background px-3" /><Button size="sm" variant="ghost">Reverse</Button></form></div> : null}</div>)}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
