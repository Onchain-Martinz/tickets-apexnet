import Link from "next/link";

import { signOut } from "@/app/auth/actions";
import { BackLink } from "@/components/layout/back-link";
import { PageShell } from "@/components/layout/page-shell";
import { WhatsAppSupportLink } from "@/components/support/whatsapp-support-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireViewer } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const viewer = await requireViewer("/account");
  const [{ data: allocations }, { data: entitlement }] = await Promise.all([
    viewer.supabase
      .from("free_exam_allocations")
      .select("id, course_code_snapshot, course_title_snapshot, assignment_position")
      .eq("user_id", viewer.user.id)
      .order("assignment_position"),
    viewer.supabase
      .from("premium_entitlements")
      .select("id, source")
      .eq("user_id", viewer.user.id)
      .is("revoked_at", null)
      .limit(1)
      .maybeSingle()
  ]);

  return (
    <PageShell>
      <div className="space-y-5">
        <BackLink href="/">Back to calendar</BackLink>
        <Card>
          <CardHeader>
            <CardTitle>{viewer.profile.full_name || "Your account"}</CardTitle>
            <p className="text-sm text-muted-foreground">{viewer.profile.email}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Level</dt>
                <dd className="font-medium">{viewer.cohort?.level === "100-level" ? "100 LEVEL" : "200 LEVEL"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Role</dt>
                <dd className="font-medium capitalize">{viewer.profile.role.replace("_", " ")}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Premium</dt>
                <dd className="font-medium">{entitlement ? "Active" : "Not active"}</dd>
              </div>
            </dl>
            <div>
              <h2 className="text-sm font-semibold">Assigned free courses</h2>
              <div className="mt-2 grid gap-2">
                {allocations?.length ? (
                  allocations.map((allocation) => (
                    <div key={allocation.id} className="rounded-[0.9rem] border border-border p-3 text-sm">
                      <span className="font-medium">{allocation.course_code_snapshot}</span>
                      <span className="text-muted-foreground"> — {allocation.course_title_snapshot}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No future courses were available when this account was created.</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {viewer.profile.role === "admin" ? (
                <Button asChild variant="secondary"><Link href="/admin">Admin dashboard</Link></Button>
              ) : null}
              {viewer.profile.role === "course_rep" ? (
                <Button asChild variant="secondary"><Link href="/rep">Commission dashboard</Link></Button>
              ) : null}
              <WhatsAppSupportLink />
              <form action={signOut}><Button type="submit" variant="ghost">Sign out</Button></form>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
