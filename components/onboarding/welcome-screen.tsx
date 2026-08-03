import { ShieldCheck } from "lucide-react";

import { BackLink } from "@/components/layout/back-link";
import { PageReveal } from "@/components/layout/page-reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { funnelCopy } from "@/lib/content/funnel-copy";

type WelcomeScreenProps = {
  action: () => Promise<void>;
  errorMessage?: string;
};

export function WelcomeScreen({ action, errorMessage }: WelcomeScreenProps) {
  return (
    <div className="mx-auto max-w-lg space-y-5">
      <BackLink href="/">Back to calendar</BackLink>
      <PageReveal>
        <Card className="overflow-hidden border-border/70 shadow-calm">
          <CardContent className="p-5 sm:p-8">
            <div className="mx-auto max-w-md space-y-6">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                  {funnelCopy.signIn.eyebrow}
                </p>
                <h1 className="text-balance text-3xl font-semibold tracking-[-0.045em] text-foreground sm:text-[2.35rem] sm:leading-[1.08]">
                  {funnelCopy.signIn.heading}
                </h1>
              </div>

              <div className="space-y-2 text-[15px] leading-7 text-muted-foreground">
                <p className="font-medium text-foreground">{funnelCopy.signIn.greeting}</p>
                <p>{funnelCopy.signIn.body}</p>
              </div>

              {errorMessage ? (
                <p className="rounded-[0.9rem] border border-border bg-muted/40 p-3 text-sm leading-6 text-foreground">
                  {errorMessage}
                </p>
              ) : null}

              <form action={action}>
                <Button type="submit" size="lg" className="w-full">
                  {funnelCopy.signIn.button}
                </Button>
              </form>

              <div className="flex items-start gap-2.5 rounded-[1rem] bg-muted/55 p-3.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <p className="text-xs leading-5 text-muted-foreground">
                  {funnelCopy.signIn.trust}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageReveal>
    </div>
  );
}
