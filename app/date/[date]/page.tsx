import { notFound } from "next/navigation";
import type { Route } from "next";

import { ExamListItem } from "@/components/exams/exam-list-item";
import { BackLink } from "@/components/layout/back-link";
import { PageShell } from "@/components/layout/page-shell";
import { PageReveal } from "@/components/layout/page-reveal";
import { Card, CardContent } from "@/components/ui/card";
import {
  defaultLevelKey,
  isLevelKey
} from "@/lib/domain/exams";
import { listExamsByDate } from "@/lib/repositories/exams";
import { formatDateLabel } from "@/lib/utils/dates";

type DatePageProps = {
  params: Promise<{
    date: string;
  }>;
  searchParams: Promise<{
    level?: string;
  }>;
};

export default async function DateDetailPage({ params, searchParams }: DatePageProps) {
  const { date } = await params;
  const { level } = await searchParams;
  const selectedLevelKey = isLevelKey(level) ? level : defaultLevelKey;
  const exams = await listExamsByDate(date, selectedLevelKey);

  if (!exams.length) {
    notFound();
  }

  const homeHref = (selectedLevelKey === defaultLevelKey
    ? "/"
    : `/?level=${selectedLevelKey}`) as Route;

  return (
    <PageShell>
      <div className="space-y-6 sm:space-y-7">
        <PageReveal>
          <BackLink href={homeHref}>Back to calendar</BackLink>
        </PageReveal>

        <PageReveal delay={0.04}>
          <section className="rounded-[1.25rem] border border-border/60 bg-card px-4 py-4 shadow-calm sm:px-5 sm:py-5">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-[1.7rem]">
                {formatDateLabel(date)}
              </h1>
              <p className="text-[13px] text-muted-foreground">
                {exams.length} exam{exams.length > 1 ? "s" : ""}
              </p>
            </div>
          </section>
        </PageReveal>

        <PageReveal delay={0.08}>
          <Card>
            <CardContent className="grid gap-2.5 p-3.5 sm:p-4">
              <div className="grid gap-2.5">
                {exams.map((exam) => (
                  <ExamListItem key={exam.slug} exam={exam} />
                ))}
              </div>
            </CardContent>
          </Card>
        </PageReveal>
      </div>
    </PageShell>
  );
}
