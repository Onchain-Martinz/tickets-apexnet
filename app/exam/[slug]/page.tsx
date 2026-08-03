import { notFound } from "next/navigation";
import type { Route } from "next";

import { ExamContentTabs } from "@/components/exams/exam-content-tabs";
import { BackLink } from "@/components/layout/back-link";
import { PageShell } from "@/components/layout/page-shell";
import { PageReveal } from "@/components/layout/page-reveal";
import { Card, CardContent } from "@/components/ui/card";
import {
  defaultLevelKey,
  getLevelKey
} from "@/lib/domain/exams";
import { getExamBySlug } from "@/lib/repositories/exams";
import { formatDayMonth } from "@/lib/utils/dates";

type ExamPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ExamDetailPage({ params }: ExamPageProps) {
  const { slug } = await params;
  const exam = await getExamBySlug(slug);

  if (!exam || exam.status === "archived") {
    notFound();
  }

  const levelKey = getLevelKey(exam);
  const levelHomeHref = (levelKey === defaultLevelKey
    ? "/"
    : `/?level=${levelKey}`) as Route;
  const isCurrentExam = exam.session === "2025/2026" && exam.semester === "Second Semester";
  const backHref =
    isCurrentExam && exam.sittings[0]
      ? (`/date/${exam.sittings[0].date}?level=${levelKey}` as Route)
      : levelHomeHref;

  return (
    <PageShell>
      <div className="space-y-6 sm:space-y-7">
        <PageReveal>
          <BackLink href={backHref}>
            {isCurrentExam && exam.sittings[0] ? "Back to date" : "Back to level"}
          </BackLink>
        </PageReveal>

        <PageReveal delay={0.04}>
          <section className="rounded-[1.5rem] border border-border/60 bg-card px-4 py-5 shadow-calm sm:px-6 sm:py-6">
            <div className="space-y-1">
              <p className="text-lg font-semibold tracking-[-0.02em] text-foreground sm:text-xl">
                {exam.courseCode}
              </p>
              <h1 className="text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-[2rem]">
                {exam.courseTitle}
              </h1>
              <p className="text-sm text-muted-foreground">
                {exam.session} {exam.semester} — {exam.level}
              </p>
              {exam.sittings.map((sitting) => (
                <div key={sitting.id} className="text-sm leading-6 text-muted-foreground">
                  <p>
                    {exam.sittings.length > 1 ? `${sitting.label}: ` : ""}
                    {formatDayMonth(sitting.date)}
                    {sitting.timeLabel ? ` — ${sitting.timeLabel}` : ""}
                  </p>
                  {sitting.venue ? <p>Venue: {sitting.venue}</p> : null}
                </div>
              ))}
              <p className="pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/80">
                {exam.status}
              </p>
              {exam.note ? (
                <p className="mt-3 max-w-3xl rounded-[0.9rem] border border-border/70 bg-muted/35 p-3 text-sm leading-6 text-foreground">
                  {exam.note}
                </p>
              ) : null}
            </div>
          </section>
        </PageReveal>

        <PageReveal delay={0.08}>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <ExamContentTabs exam={exam} />
            </CardContent>
          </Card>
        </PageReveal>
      </div>
    </PageShell>
  );
}
