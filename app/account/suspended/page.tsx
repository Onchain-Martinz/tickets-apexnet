import { signOut } from "@/app/auth/actions";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SuspendedAccountPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Account suspended</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              This account cannot open protected exam resources. Contact an administrator if you believe this is a mistake.
            </p>
            <form action={signOut} className="mt-4">
              <Button type="submit" variant="secondary">Sign out</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
