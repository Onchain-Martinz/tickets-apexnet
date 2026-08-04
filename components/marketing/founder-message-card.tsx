import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

type FounderMessageCardProps = {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  showAvatar?: boolean;
};

export function FounderMessageCard({
  eyebrow,
  title,
  children,
  actions,
  className = "",
  showAvatar = true
}: FounderMessageCardProps) {
  return (
    <Card className={`overflow-hidden border-border/70 shadow-calm ${className}`}>
      <CardContent className="p-5 sm:p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className={showAvatar ? "flex items-center gap-3" : "space-y-1.5"}>
            {showAvatar ? (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                M
              </div>
            ) : null}
            <div className="min-w-0 space-y-0.5">
              {eyebrow ? (
                <p className="text-[10px] font-semibold uppercase tracking-[0.19em] text-primary">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="text-balance text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-[2rem]">
                {title}
              </h1>
            </div>
          </div>
          {children}
          {actions ? <div className="pt-1">{actions}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}
