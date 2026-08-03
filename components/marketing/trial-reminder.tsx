"use client";

import { useState } from "react";

import { FounderMessageCard } from "@/components/marketing/founder-message-card";
import { Button } from "@/components/ui/button";
import { funnelCopy, trialReminderMessage } from "@/lib/content/funnel-copy";

type TrialReminderProps = {
  name: string;
  price: string;
};

export function TrialReminder({ name, price }: TrialReminderProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  function continuePreparing() {
    document.getElementById("exam-content")?.scrollIntoView({ behavior: "smooth" });
    setVisible(false);
  }

  return (
    <FounderMessageCard
      eyebrow="Your second free preparation"
      title={funnelCopy.trialReminder.greeting(name)}
      actions={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" onClick={continuePreparing}>
            {funnelCopy.trialReminder.continue}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setVisible(false)}>
            {funnelCopy.trialReminder.dismiss}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-sm leading-6 text-muted-foreground sm:text-[15px] sm:leading-7">
        {trialReminderMessage(price).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </FounderMessageCard>
  );
}
