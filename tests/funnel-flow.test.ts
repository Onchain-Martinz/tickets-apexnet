import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  founderMessage,
  getFirstName,
  paywallMessage
} from "@/lib/content/funnel-copy";
import { getOnboardingContinuePath } from "@/lib/auth/onboarding-next";

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

describe("founder-led onboarding funnel", () => {
  it("routes a successful onboarding through the founder welcome without changing the RPC", () => {
    const action = source("../app/onboarding/actions.ts");
    const rpcIndex = action.indexOf('"complete_onboarding"');
    const welcomeIndex = action.indexOf("/onboarding/welcome?next=");

    expect(rpcIndex).toBeGreaterThan(-1);
    expect(welcomeIndex).toBeGreaterThan(rpcIndex);
    expect(action).toContain("if (viewer.profile.onboarding_completed_at) redirect(safeNext)");
  });

  it("keeps the founder destination constrained by the existing safe-next helper", () => {
    const page = source("../app/onboarding/welcome/page.tsx");

    expect(page).toContain("getSafeNextPath(params.next)");
    expect(page).toContain("requireViewer(");
  });

  it("preserves a valid calendar destination and its level query", () => {
    expect(
      getOnboardingContinuePath(
        "/date/2026-08-12?level=100-level",
        "100-level"
      )
    ).toBe("/date/2026-08-12?level=100-level");
  });

  it("returns a root destination to the selected level calendar", () => {
    expect(getOnboardingContinuePath("/", "100-level")).toBe("/");
    expect(getOnboardingContinuePath("/", "200-level")).toBe("/?level=200-level");
  });

  it("does not generate invalid or unsafe calendar routes", () => {
    expect(getOnboardingContinuePath("/date/2026-02-31", "200-level")).toBe(
      "/?level=200-level"
    );
    expect(getOnboardingContinuePath("/does-not-exist", "100-level")).toBe("/");
    expect(getOnboardingContinuePath("https://evil.example/date/2026-08-12", "100-level")).toBe(
      "/"
    );
  });

  it("personalizes founder copy and preserves one-time pricing language", () => {
    expect(getFirstName("Ada Nwosu")).toBe("Ada");
    expect(getFirstName(" ")).toBe("there");
    expect(founderMessage("Ada", "₦1,500").join(" ")).toContain("Full access is ₦1,500 once");
    expect(paywallMessage("₦1,500").join(" ")).toContain("No subscription. No recurring payments.");
  });

  it("shows the same-day reminder only for the second free allocation", () => {
    const examPage = source("../app/exam/[slug]/page.tsx");

    expect(examPage).toContain("currentAllocation?.assignment_position === 2");
    expect(examPage).toContain("sitting.date === currentDateInLagos()");
  });

  it("keeps date-page filtering aligned with the calendar URL", () => {
    const datePage = source("../app/date/[date]/page.tsx");

    expect(datePage).toContain("listExamsByDate(date, requestedLevelKey)");
    expect(datePage).not.toContain("viewer.cohort?.level ?? requestedLevelKey");
  });
});
