import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";

import { loginAdminAction } from "@/app/admin/actions";
import { isAdminAuthenticated } from "@/lib/auth/admin-auth";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

type AdminLoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const { next = "/admin", error } = await searchParams;

  return (
    <PageShell>
      <div className="mx-auto max-w-sm pt-8 sm:pt-16">
        <Card className="border-white/10 bg-zinc-950/80 shadow-2xl backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
              <Lock className="size-6" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-white">
              Organizer Access
            </CardTitle>
            <p className="text-xs text-zinc-400">
              Enter the admin password to access ticket sales and attendee records.
            </p>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            {error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-400 text-center">
                {error}
              </div>
            ) : null}

            <form action={loginAdminAction} className="space-y-4">
              <input type="hidden" name="next" value={next} />

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400"
                >
                  Admin Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoFocus
                  placeholder="••••••••••••"
                  className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900/90 px-4 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>

              <Button
                type="submit"
                className="h-12 w-full gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-lg shadow-violet-600/25 transition-all"
              >
                <ShieldCheck className="size-4" />
                Unlock Dashboard
              </Button>
            </form>

            <div className="pt-2 text-center">
              <Button asChild variant="ghost" size="sm">
                <Link href="/" className="gap-1.5 text-xs text-zinc-400 hover:text-white">
                  <ArrowLeft className="size-3.5" />
                  Return to Event Page
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
