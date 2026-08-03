import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const home = source("../app/page.tsx");
const datePage = source("../app/date/[date]/page.tsx");
const examPage = source("../app/exam/[slug]/page.tsx");
const returnPage = source("../app/payment/return/page.tsx");
const onboardingAction = source("../app/onboarding/actions.ts");

describe("route security contracts", () => {
  it("keeps the homepage calendar public", () => {
    expect(home).not.toContain("requireViewer(");
    expect(home).toContain("listExamsByLevel");
  });

  it("protects date and course routes", () => {
    expect(datePage).toContain("requireViewer(");
    expect(examPage).toContain("requireViewer(");
  });

  it("does not load full academic content before access is granted", () => {
    expect(examPage.indexOf("getCourseAccess(")).toBeLessThan(
      examPage.indexOf("getExamBySlug(slug)")
    );
  });

  it("does not finalize access from the payment return page", () => {
    expect(returnPage).not.toContain("finalize_verified_payment");
    expect(returnPage).not.toContain("verifyAndFinalizePayment");
  });

  it("contains no browser-return payment finalization path", () => {
    expect(returnPage).not.toContain("confirmDevelopmentKoraReturn");
    expect(returnPage).not.toContain("developmentReturnFinalizationEnabled");
    expect(returnPage).not.toContain("verifyAndFinalizePayment");
  });

  it("uses the query string only as a safe return path during onboarding", () => {
    expect(onboardingAction).toContain("getSafeNextPath(nextPath)");
    expect(onboardingAction).toContain('formData.get("level")');
    expect(onboardingAction).not.toContain('formData.get("course_slug")');
  });
});

function source(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}
