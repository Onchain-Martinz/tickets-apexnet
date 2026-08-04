"use client";

import { type ReactNode, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnswerDTO, QuestionOptionDTO, QuestionSource } from "@/lib/domain/exams";
import { cn } from "@/lib/utils";

type QuestionRevealItem = {
  id: string;
  number: string;
  text: string;
  source: QuestionSource;
  options: QuestionOptionDTO[];
  answer: AnswerDTO | null;
  answerStatus: "available" | "needs_review";
};

export function QuestionRevealCard({
  item,
  children
}: {
  item: QuestionRevealItem;
  children?: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const correctOption = item.options.find((option) => option.key === item.answer?.text);
  const answerId = `${item.id}-answer`;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {item.source === "generated_practice" ? "AI practice question" : "Past question"} {item.number}
            </p>
            <pre className="max-w-3xl whitespace-pre-wrap break-words font-sans text-sm leading-6 text-foreground">
              {item.text}
            </pre>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 self-start rounded-full border border-border/70 bg-background/80 px-3 text-[12px] text-muted-foreground hover:bg-accent/10 hover:text-foreground"
            onClick={() => setIsOpen((open) => !open)}
            aria-controls={answerId}
            aria-expanded={isOpen}
          >
            {isOpen ? "Hide Answer" : "Reveal Answer"}
          </Button>
        </div>

        {item.options.length ? (
          <ol className="mt-4 grid gap-2" aria-label={`Options for question ${item.number}`}>
            {item.options.map((option) => {
              const isCorrect = isOpen && option.key === item.answer?.text;

              return (
                <li
                  key={option.key}
                  className={cn(
                    "flex gap-3 rounded-[0.85rem] border border-border/70 bg-muted/35 px-3 py-2.5 text-sm leading-6 transition-colors",
                    isCorrect && "border-primary/50 bg-primary/10 text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "font-semibold text-muted-foreground",
                      isCorrect && "text-primary"
                    )}
                  >
                    {option.key}.
                  </span>
                  <span>{option.text}</span>
                  {isCorrect ? (
                    <span className="ml-auto shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                      Correct
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        ) : null}

        {children}

        <AnimatePresence initial={false}>
          {isOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
              id={answerId}
            >
              <div className="mt-4 rounded-[1rem] border border-border/70 bg-muted/35 p-3.5 sm:p-4">
                {item.answerStatus === "available" && item.answer ? (
                  <>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Correct answer
                    </p>
                    <pre className="mt-2 max-w-3xl whitespace-pre-wrap break-words font-sans text-sm leading-6 text-foreground">
                      {correctOption
                        ? `${correctOption.key}. ${correctOption.text}`
                        : item.answer.text}
                    </pre>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">
                      Answer under review
                    </p>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                      A reliable answer was not available in the supplied source, so no answer has been guessed.
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
