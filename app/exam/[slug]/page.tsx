import { notFound } from "next/navigation";
import type { Route } from "next";

import { ExamContentTabs } from "@/components/exams/exam-content-tabs";
import { BackLink } from "@/components/layout/back-link";
import { PageShell } from "@/components/layout/page-shell";
import { PageReveal } from "@/components/layout/page-reveal";
import { FirstExamSuccess } from "@/components/marketing/first-exam-success";
import { TrialReminder } from "@/components/marketing/trial-reminder";
import { PremiumPaywall } from "@/components/payments/premium-paywall";
import { Card, CardContent } from "@/components/ui/card";
import { getCourseAccess } from "@/lib/access/authorization";
import { requireViewer } from "@/lib/auth/session";
import { formatPlanPrice, getFirstName } from "@/lib/content/funnel-copy";
import {
  defaultLevelKey,
  getLevelKey
} from "@/lib/domain/exams";
import { getExamBySlug, getExamScheduleBySlug } from "@/lib/repositories/exams";
import { formatDayMonth } from "@/lib/utils/dates";

type ExamPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ExamDetailPage({ params }: ExamPageProps) {
  const { slug } = await params;
  const schedule = await getExamScheduleBySlug(slug);

  if (!schedule) {
    notFound();
  }

  const viewer = await requireViewer(`/exam/${slug}`);
  const access = await getCourseAccess(
    viewer.supabase,
    viewer.profile,
    viewer.cohort,
    schedule
  );

  if (
    !access.allowed &&
    (access.reason === "locked" ||
      access.reason === "wrong_level" ||
      access.reason === "wrong_offering")
  ) {
    const { data: premiumPlan } = viewer.cohort
      ? await viewer.supabase
          .from("premium_plans")
          .select("amount_minor, currency")
          .eq("cohort_id", viewer.cohort.id)
          .eq("status", "active")
          .maybeSingle()
      : { data: null };

    return (
      <PageShell>
        <PremiumPaywall
          schedule={schedule}
          userName={viewer.profile.full_name}
          plan={premiumPlan
            ? {
                amountMinor: Number(premiumPlan.amount_minor),
                currency: premiumPlan.currency
              }
            : null}
        />
      </PageShell>
    );
  }

  if (!access.allowed) {
    return (
      <PageShell>
        <div className="mx-auto max-w-xl space-y-5">
          <BackLink href="/">Back to calendar</BackLink>
          <Card>
            <CardContent className="p-5 text-sm leading-6 text-muted-foreground">
              This course belongs to a different level or offering from the one saved on your account.
            </CardContent>
          </Card>
        </div>
      </PageShell>
    );
  }

  const exam = await getExamBySlug(slug);
  if (!exam || exam.status === "archived") notFound();

  const { data: freeAllocations } = access.source === "free" && viewer.cohort
    ? await viewer.supabase
        .from("free_exam_allocations")
        .select("course_slug, assignment_position")
        .eq("user_id", viewer.user.id)
        .eq("cohort_id", viewer.cohort.id)
        .order("assignment_position")
    : { data: null };
  const currentAllocation = freeAllocations?.find(
    (allocation) => allocation.course_slug === schedule.slug
  );
  const nextAllocation = freeAllocations?.find(
    (allocation) => allocation.assignment_position === 2
  );
  const showTrialReminder =
    currentAllocation?.assignment_position === 2 &&
    schedule.sittings.some((sitting) => sitting.date === currentDateInLagos());
  const { data: reminderPlan } = showTrialReminder && viewer.cohort
    ? await viewer.supabase
        .from("premium_plans")
        .select("amount_minor, currency")
        .eq("cohort_id", viewer.cohort.id)
        .eq("status", "active")
        .maybeSingle()
    : { data: null };
  const reminderPrice = formatPlanPrice(
    reminderPlan
      ? {
          amountMinor: Number(reminderPlan.amount_minor),
          currency: reminderPlan.currency
        }
      : null
  ) ?? "₦1,500";
  const firstName = getFirstName(viewer.profile.full_name);

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
          {showTrialReminder ? (
            <div className="mb-6">
              <TrialReminder name={firstName} price={reminderPrice} />
            </div>
          ) : null}
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
          <Card id="exam-content">
            <CardContent className="p-4 sm:p-5">
              <ExamContentTabs exam={exam} />
              {currentAllocation?.assignment_position === 1 ? (
                <FirstExamSuccess
                  name={firstName}
                  storageKey={`imsu-exam-prep:${viewer.profile.id}:${schedule.slug}:complete`}
                  nextHref={nextAllocation ? `/exam/${nextAllocation.course_slug}` : "/"}
                />
              ) : null}
            </CardContent>
          </Card>
        </PageReveal>
      </div>
    </PageShell>
  );
}

function currentDateInLagos() {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${value("year")}-${value("month")}-${value("day")}`;
}
