import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

function source(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

describe("targeted UI polish", () => {
  it("adds the course discovery hint without changing the course-card navigation", () => {
    const datePage = source("../app/date/[date]/page.tsx");
    const examListItem = source("../components/exams/exam-list-item.tsx");

    expect(datePage).toContain(
      "✨ Tap any course card to explore past questions and study materials"
    );
    expect(examListItem).toContain("<Link");
    expect(examListItem).toContain('href={`/exam/${exam.slug}`}');
  });

  it("uses the shared question-card surfaces for AI practice content", () => {
    const panel = source("../components/exams/past-questions-panel.tsx");
    const questionCard = source("../components/exams/question-reveal-card.tsx");

    expect(panel).toContain('<div className="space-y-3 sm:space-y-4">');
    expect(panel).toContain("<QuestionRevealCard");
    expect(questionCard).toContain("bg-muted/35");
    expect(questionCard).not.toContain("bg-background/55");
  });

  it("provides non-blocking navigation feedback with reduced-motion support", () => {
    const layout = source("../app/layout.tsx");
    const loading = source("../components/layout/navigation-loading-indicator.tsx");
    const styles = source("../app/globals.css");

    expect(layout).toContain("<NavigationLoadingIndicator />");
    expect(loading).toContain("pointer-events-none");
    expect(loading).toContain('document.addEventListener("click"');
    expect(loading).toContain('document.addEventListener("submit"');
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("removes the placeholder only from the personalized unlock card", () => {
    const card = source("../components/marketing/founder-message-card.tsx");
    const paywall = source("../components/marketing/soft-paywall.tsx");
    const copy = source("../lib/content/funnel-copy.ts");

    expect(card).toContain("showAvatar = true");
    expect(paywall).toContain("showAvatar={false}");
    expect(paywall).toContain('eyebrow="Full exam access"');
    expect(copy).toContain("ready for your next exam? 🚀");
    expect(copy).toContain("No subscription. No recurring payments.");
  });

  it("keeps visitor analytics inside the protected admin view", () => {
    const adminPage = source("../app/admin/page.tsx");
    const analytics = source("../components/analytics/google-analytics.tsx");
    const visitorOverview = source("../lib/analytics/visitor-overview.ts");

    expect(adminPage.indexOf("requireAdmin()")).toBeLessThan(
      adminPage.indexOf("getVisitorOverview()")
    );
    expect(adminPage).toContain("Anonymous Visitors");
    expect(analytics).toContain("user_id: userId");
    expect(visitorOverview).toContain('dimensions: [{ name: "signedInWithUserId" }]');
    expect(visitorOverview).toContain('metrics: [{ name: "totalUsers" }]');
  });
});
