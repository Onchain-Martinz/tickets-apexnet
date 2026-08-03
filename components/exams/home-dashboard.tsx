"use client";

import { useEffect, useMemo, useState } from "react";

import { ExamCalendarGrid } from "@/components/calendar/exam-calendar-grid";
import { CountdownCard } from "@/components/exams/countdown-card";
import { OverviewCard } from "@/components/exams/overview-card";
import { Card, CardContent } from "@/components/ui/card";
import { CourseScheduleDTO, LevelKey } from "@/lib/domain/exams";
import {
  compareSittings,
  getSittingDateTime,
  isSittingUpcoming
} from "@/lib/utils/dates";

type HomeDashboardProps = {
  exams: CourseScheduleDTO[];
  levelKey: LevelKey;
  calendarTitle: string;
};

export function HomeDashboard({
  exams,
  levelKey,
  calendarTitle
}: HomeDashboardProps) {
  const scheduledExams = useMemo(
    () => exams.filter((exam) => exam.sittings.length > 0),
    [exams]
  );
  const [currentTime, setCurrentTime] = useState(() => {
    const firstSitting = scheduledExams[0]?.sittings[0];
    return firstSitting ? getSittingDateTime(firstSitting).getTime() : 0;
  });

  useEffect(() => {
    const syncClock = () => {
      setCurrentTime(Date.now());
    };

    const frameId = window.requestAnimationFrame(syncClock);
    const intervalId = window.setInterval(syncClock, 1000);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearInterval(intervalId);
    };
  }, []);

  const totalCourses = exams.length;

  const upcomingSittings = useMemo(() => {
    const referenceDate = new Date(currentTime);
    return scheduledExams
      .flatMap((schedule) =>
        schedule.sittings.map((sitting) => ({ schedule, sitting }))
      )
      .filter(({ sitting }) => isSittingUpcoming(sitting, referenceDate))
      .sort((left, right) => compareSittings(left.sitting, right.sitting));
  }, [currentTime, scheduledExams]);

  const examsLeft = useMemo(() => {
    const referenceDate = new Date(currentTime);
    return scheduledExams.filter((schedule) =>
      schedule.sittings.some((sitting) => isSittingUpcoming(sitting, referenceDate))
    ).length;
  }, [currentTime, scheduledExams]);

  const nextExam = upcomingSittings[0] ?? null;

  const millisecondsRemaining = nextExam
    ? Math.max(getSittingDateTime(nextExam.sitting).getTime() - currentTime, 0)
    : 0;

  if (!exams.length) {
    return null;
  }

  return (
    <div className="space-y-3.5 sm:space-y-4">
      <section className="grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_18.5rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_19rem]">
        <OverviewCard
          totalCourses={totalCourses}
          examsLeft={examsLeft}
          nextExam={nextExam}
        />
        <CountdownCard nextExam={nextExam} millisecondsRemaining={millisecondsRemaining} />
      </section>

      {scheduledExams.length ? (
        <ExamCalendarGrid
          exams={scheduledExams}
          currentTime={currentTime}
          levelKey={levelKey}
          title={calendarTitle}
        />
      ) : (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground sm:p-5">
            No confirmed exam dates are available for this semester yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
