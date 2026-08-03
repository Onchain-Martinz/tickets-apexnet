"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OutlineTopicDTO } from "@/lib/domain/exams";

export function TopicKeyPointsItem({ item }: { item: OutlineTopicDTO }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="max-w-3xl text-sm font-semibold leading-6 tracking-[-0.01em] text-foreground">
              {item.text}
            </h3>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 self-start rounded-full border border-border/70 bg-background/80 px-3 text-[12px] text-muted-foreground hover:bg-accent/10 hover:text-foreground"
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? "Hide Key Points" : "Reveal Key Points"}
          </Button>
        </div>

        <AnimatePresence initial={false}>
          {isOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="mt-4 rounded-[1rem] border border-border/70 bg-muted/35 p-3.5 sm:p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Key Points
                </p>
                <ul className="mt-2 space-y-2 pl-4 text-sm leading-6 text-foreground marker:text-muted-foreground">
                  {item.keyPoints.map((point) => (
                    <li key={point.id} className="break-words">
                      {point.text}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
