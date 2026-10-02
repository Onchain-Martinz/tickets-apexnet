import { redirect } from "next/navigation";
import { Lock } from "lucide-react";

import { signInWithGoogle } from "@/app/auth/actions";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSafeNextPath } from "@/lib/auth/safe-next";
import { getViewer } from "@/lib/auth/session";

type SignInPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  oauth_cancelled: "Google sign-in was cancelled. You can try again when ready.",
  oauth_callback_failed: "Google sign-in could not be completed. Please try again.",
  oauth_start_failed: "Google sign-in is temporarily unavailable. Please try again.",
  profile_missing: "Your account profile could not be loaded. Please contact the administrator.",
  not_configured: "Authentication has not been configured for this deployment yet."
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(params.next ?? "/admin");
  const viewer = await getViewer();

  if (viewer?.profile) {
    redirect(nextPath);
  }

  const action = signInWithGoogle.bind(null, nextPath);

  return (
    <PageShell className="sm:pt-16">
      <div className="mx-auto max-w-sm">
        <Card className="border-border/80 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Lock className="size-6" />
            </div>
            <CardTitle className="text-xl font-bold">Organizer Access</CardTitle>
            <p className="text-xs text-muted-foreground">
              Sign in with your authorized Google account to view ticket sales.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {params.error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                {errorMessages[params.error] ?? "Sign-in could not be completed."}
              </div>
            ) : null}

            <form action={action}>
              <Button type="submit" size="lg" className="w-full gap-2 font-semibold">
                Sign in with Google
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
