import { BackLink } from "@/components/layout/back-link";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCourseRep } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type RepSale = {
  commission_id: string;
  buyer_full_name: string;
  buyer_email_masked: string;
  purchase_date: string;
  sale_amount_minor: number;
  commission_amount_minor: number;
  commission_status: "pending" | "paid" | "reversed";
};

export default async function RepDashboardPage() {
  const viewer = await requireCourseRep();
  const [{ data: assignment }, { data }] = await Promise.all([
    viewer.supabase
      .from("course_rep_assignments")
      .select("id, cohort_id, commission_bps, status, assigned_at, cohorts(level, academic_session, semester)")
      .eq("user_id", viewer.user.id)
      .eq("status", "active")
      .maybeSingle(),
    viewer.supabase.rpc("get_my_rep_sales")
  ]);
  const sales = (data as RepSale[] | null) ?? [];
  const verifiedSales = sales.filter((sale) => sale.commission_status !== "reversed");
  const money = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" });
  const totalSales = verifiedSales.reduce((sum, sale) => sum + Number(sale.sale_amount_minor), 0);
  const totalCommission = verifiedSales.reduce((sum, sale) => sum + Number(sale.commission_amount_minor), 0);
  const pending = sales.filter((sale) => sale.commission_status === "pending").reduce((sum, sale) => sum + Number(sale.commission_amount_minor), 0);
  const paid = sales.filter((sale) => sale.commission_status === "paid").reduce((sum, sale) => sum + Number(sale.commission_amount_minor), 0);

  return (
    <PageShell>
      <div className="space-y-5">
        <BackLink href="/account">Back to account</BackLink>
        <section className="rounded-[1.5rem] border border-border/60 bg-card p-5 shadow-calm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Course representative</p>
          <h1 className="mt-1 text-2xl font-semibold">Commission dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">{assignment ? `${assignment.commission_bps / 100}% commission · active cohort assignment` : "No active course-representative assignment."}</p>
        </section>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[["Verified sales", money.format(totalSales / 100)], ["Commission earned", money.format(totalCommission / 100)], ["Pending", money.format(pending / 100)], ["Paid", money.format(paid / 100)]].map(([label, value]) => <Card key={label}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></CardContent></Card>)}
        </div>
        <Card>
          <CardHeader><CardTitle>Sales</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {sales.length ? sales.map((sale) => <div key={sale.commission_id} className="rounded-[0.9rem] border p-3 text-sm"><p className="font-medium">{sale.buyer_full_name || "Student"} · {sale.buyer_email_masked}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(sale.purchase_date).toLocaleDateString("en-NG")} · {money.format(Number(sale.sale_amount_minor) / 100)} sale · {money.format(Number(sale.commission_amount_minor) / 100)} commission · {sale.commission_status}</p></div>) : <p className="text-sm text-muted-foreground">No verified sales yet.</p>}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
