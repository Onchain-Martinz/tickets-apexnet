import Link from "next/link";
import type { Route } from "next";

import { PageReveal } from "@/components/layout/page-reveal";
import { FounderMessageCard } from "@/components/marketing/founder-message-card";
import { Button } from "@/components/ui/button";
import { founderMessage, funnelCopy } from "@/lib/content/funnel-copy";

type FounderMessageProps = {
  name: string;
  price: string;
  nextHref: string;
};

export function FounderMessage({ name, price, nextHref }: FounderMessageProps) {
  const paragraphs = founderMessage(name, price);

  return (
    <PageReveal>
      <FounderMessageCard
        eyebrow={funnelCopy.founder.eyebrow}
        title={funnelCopy.founder.title}
        actions={
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={nextHref as Route}>{funnelCopy.founder.button}</Link>
          </Button>
        }
      >
        <div className="space-y-4 text-[15px] leading-7 text-muted-foreground">
          {paragraphs.map((paragraph, index) => (
            <p
              key={paragraph}
              className={
                index === 0 || paragraph.startsWith("My goal")
                  ? "font-medium text-foreground"
                  : undefined
              }
            >
              {paragraph}
            </p>
          ))}
          <p className="font-medium text-foreground">{funnelCopy.founder.signature}</p>
        </div>
      </FounderMessageCard>
    </PageReveal>
  );
}
