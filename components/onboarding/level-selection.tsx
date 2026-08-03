import { GraduationCap } from "lucide-react";

import { PageReveal } from "@/components/layout/page-reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { funnelCopy } from "@/lib/content/funnel-copy";

type LevelSelectionProps = {
  action: (formData: FormData) => Promise<void>;
  errorMessage?: string;
};

const levels = [
  { value: "100-level", label: "100 Level", description: "First-year Psychology courses" },
  { value: "200-level", label: "200 Level", description: "Second-year Psychology courses" }
] as const;

export function LevelSelection({ action, errorMessage }: LevelSelectionProps) {
  return (
    <PageReveal>
      <Card className="mx-auto max-w-xl overflow-hidden border-border/70 shadow-calm">
        <CardContent className="p-5 sm:p-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <GraduationCap className="size-5" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                  {funnelCopy.levelSelection.eyebrow}
                </p>
                <h1 className="text-balance text-3xl font-semibold tracking-[-0.045em] text-foreground sm:text-[2.2rem] sm:leading-[1.1]">
                  {funnelCopy.levelSelection.heading}
                </h1>
                <p className="max-w-lg text-sm leading-6 text-muted-foreground sm:text-[15px]">
                  {funnelCopy.levelSelection.body}
                </p>
              </div>
            </div>

            {errorMessage ? (
              <p className="rounded-[0.9rem] border border-border bg-muted/40 p-3 text-sm text-foreground">
                {errorMessage}
              </p>
            ) : null}

            <form action={action} className="space-y-5">
              <fieldset className="grid gap-3 sm:grid-cols-2">
                <legend className="sr-only">Select level</legend>
                {levels.map((level) => (
                  <label
                    key={level.value}
                    className="group relative flex min-h-28 cursor-pointer flex-col justify-between rounded-[1.15rem] border border-border bg-card p-4 transition-colors hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/[0.045] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2"
                  >
                    <input
                      type="radio"
                      name="level"
                      value={level.value}
                      required
                      className="size-4 accent-primary"
                    />
                    <span className="space-y-0.5">
                      <span className="block text-base font-semibold tracking-[-0.02em] text-foreground">
                        {level.label}
                      </span>
                      <span className="block text-xs leading-5 text-muted-foreground">
                        {level.description}
                      </span>
                    </span>
                  </label>
                ))}
              </fieldset>
              <Button type="submit" size="lg" className="w-full">
                {funnelCopy.levelSelection.button}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </PageReveal>
  );
}
