"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { funnelCopy } from "@/lib/content/funnel-copy";

type FirstExamSuccessProps = {
  name: string;
  storageKey: string;
  nextHref: string;
};

export function FirstExamSuccess({ name, storageKey, nextHref }: FirstExamSuccessProps) {
  const [completed, setCompleted] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setCompleted(window.localStorage.getItem(storageKey) === "complete");
  }, [storageKey]);

  function finishPreparation() {
    window.localStorage.setItem(storageKey, "complete");
    setCompleted(true);
    setOpen(true);
  }

  return (
    <>
      {!completed ? (
        <div className="mt-5 flex flex-col items-start justify-between gap-3 rounded-[1rem] border border-border bg-muted/35 p-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-foreground">Finished reviewing this course?</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Mark this preparation complete when you are ready to move on.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={finishPreparation}>
            Finish preparation
          </Button>
        </div>
      ) : null}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="first-exam-success-title"
        >
          <Card className="w-full max-w-md border-border/70 shadow-calm">
            <CardContent className="space-y-5 p-5 sm:p-7">
              <div className="space-y-3">
                <h2
                  id="first-exam-success-title"
                  className="text-2xl font-semibold tracking-[-0.04em] text-foreground"
                >
                  {funnelCopy.firstExamSuccess.title(name)}
                </h2>
                <div className="space-y-2 text-sm leading-6 text-muted-foreground">
                  {funnelCopy.firstExamSuccess.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
              <Button asChild className="w-full">
                <Link href={nextHref as Route}>{funnelCopy.firstExamSuccess.button}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
