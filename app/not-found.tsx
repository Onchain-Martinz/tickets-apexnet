import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <PageShell>
      <Card className="mx-auto max-w-md">
        <CardContent className="space-y-4 p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
            404 Not Found
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            This page does not exist.
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            The page you are looking for could not be found.
          </p>
          <Button asChild className="w-full">
            <Link href="/">Back to Event Page</Link>
          </Button>
        </CardContent>
      </Card>
    </PageShell>
  );
}
