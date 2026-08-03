import Link from "next/link";
import type { Route } from "next";

import { HomeDashboard } from "@/components/exams/home-dashboard";
import { PageShell } from "@/components/layout/page-shell";
import { PageReveal } from "@/components/layout/page-reveal";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  defaultLevelKey,
  isLevelKey,
  levelOptions
} from "@/lib/domain/exams";
import { listExamsByLevel } from "@/lib/repositories/exams";

type HomePageProps = {
  searchParams: Promise<{
    level?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { level } = await searchParams;
  const selectedLevelKey = isLevelKey(level) ? level : defaultLevelKey;
  const selectedLevel = levelOptions.find((option) => option.key === selectedLevelKey)!;
  const exams = await listExamsByLevel(selectedLevelKey);

  return (
    <PageShell>
      <div className="space-y-4 sm:space-y-5 lg:space-y-6">
        <PageReveal>
          <header className="flex items-start justify-between gap-3 px-1 py-0.5 sm:px-0">
            <div className="min-w-0 flex-1 space-y-1">
              <h1 className="text-[1.4rem] font-semibold tracking-[-0.035em] text-foreground sm:text-[1.55rem]">
                Exam Study Plan
              </h1>
              <p className="text-sm text-muted-foreground">
                Track upcoming papers and open each exam when you need it.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 pt-0.5">
              <Link
                href="/account"
                className="rounded-full px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Account
              </Link>
              <ThemeToggle />
            </div>
          </header>
        </PageReveal>

        <PageReveal delay={0.03}>
          <nav
            aria-label="Level selection"
            className="grid grid-cols-2 gap-1 rounded-[1rem] border border-border bg-secondary p-1 sm:inline-grid"
          >
            {levelOptions.map((option) => {
              const active = option.key === selectedLevelKey;
              const href = (option.key === defaultLevelKey
                ? "/"
                : `/?level=${option.key}`) as Route;

              return (
                <Link
                  key={option.key}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "inline-flex min-h-10 items-center justify-center rounded-[0.8rem] px-3 py-2 text-center text-[12px] font-medium transition-colors sm:text-[13px]",
                    active
                      ? "bg-card text-foreground shadow-card"
                      : "text-muted-foreground hover:text-foreground"
                  ].join(" ")}
                >
                  {option.label}
                </Link>
              );
            })}
          </nav>
        </PageReveal>

        <PageReveal delay={0.05}>
          <HomeDashboard
            exams={exams}
            levelKey={selectedLevelKey}
            calendarTitle={`${selectedLevel.label} EXAM CALENDAR`}
          />
        </PageReveal>
      </div>
    </PageShell>
  );
}
