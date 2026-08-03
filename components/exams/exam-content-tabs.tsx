"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { PastQuestionsPanel } from "@/components/exams/past-questions-panel";
import { TopicsPanel } from "@/components/exams/topics-panel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseDetailDTO } from "@/lib/domain/exams";

export function ExamContentTabs({ exam }: { exam: CourseDetailDTO }) {
  const [tab, setTab] = useState("past-questions");

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full space-y-0">
      <TabsList
        aria-label="Exam resources"
        className="!grid !w-full max-w-full grid-cols-2 justify-stretch sm:!w-auto"
      >
        <TabsTrigger
          value="past-questions"
          className="min-w-0 px-2 text-[11px] leading-4 whitespace-normal text-center sm:px-3 sm:text-[13px] sm:leading-none sm:whitespace-nowrap"
        >
          <span className="sm:hidden">
            Past
            <br />
            Questions
          </span>
          <span className="hidden sm:inline">Past Questions</span>
        </TabsTrigger>
        <TabsTrigger
          value="topics-to-read"
          className="min-w-0 px-2 text-[11px] leading-4 whitespace-normal text-center sm:px-3 sm:text-[13px] sm:leading-none sm:whitespace-nowrap"
        >
          <span className="sm:hidden">
            Topics
            <br />
            to Read
          </span>
          <span className="hidden sm:inline">Topics to Read</span>
        </TabsTrigger>
      </TabsList>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mt-4 sm:mt-5"
        >
          {tab === "past-questions" ? (
            <PastQuestionsPanel questionSet={exam.questionSet} />
          ) : (
            <TopicsPanel outline={exam.outline} />
          )}
        </motion.div>
      </AnimatePresence>
    </Tabs>
  );
}
