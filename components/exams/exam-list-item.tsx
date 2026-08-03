import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { CourseScheduleDTO } from "@/lib/domain/exams";
import { formatDayMonth } from "@/lib/utils/dates";

export function ExamListItem({ exam }: { exam: CourseScheduleDTO }) {
  return (
    <Link
      href={`/exam/${exam.slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
    >
      <Card className="transition-[transform,border-color,box-shadow] duration-200 group-hover:-translate-y-0.5 group-hover:border-foreground/10 group-hover:shadow-calm">
        <CardContent className="flex items-center justify-between gap-3 p-3.5 sm:p-4">
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {exam.courseCode} · {exam.level}
            </p>
            <h2 className="text-[15px] font-semibold leading-5 tracking-[-0.02em] text-foreground sm:text-base">
              {exam.courseTitle}
            </h2>
            {exam.sittings.map((sitting) => (
              <div key={sitting.id} className="text-[13px] leading-5 text-muted-foreground">
                <p>
                  {exam.sittings.length > 1 ? `${sitting.label}: ` : ""}
                  {formatDayMonth(sitting.date)}
                  {sitting.timeLabel ? ` — ${sitting.timeLabel}` : ""}
                </p>
                {sitting.venue ? (
                  <p className="text-[12px]">Venue: {sitting.venue}</p>
                ) : null}
              </div>
            ))}
          </div>
          <ArrowRight className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
