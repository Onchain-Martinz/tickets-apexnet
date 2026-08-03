import { describe, expect, it } from "vitest";

import { evaluateCourseAccess } from "@/lib/access/rules";

const base = {
  authenticated: true,
  onboardingComplete: true,
  accountActive: true,
  admin: false,
  sameLevel: true,
  sameOffering: true,
  freeAssignment: false,
  premiumEntitlement: false
};

describe("course access rules", () => {
  it("requires authentication for protected content", () => {
    expect(evaluateCourseAccess({ ...base, authenticated: false })).toEqual({ allowed: false, reason: "authentication_required" });
  });

  it("opens an assigned free course", () => {
    expect(evaluateCourseAccess({ ...base, freeAssignment: true })).toEqual({ allowed: true, source: "free" });
  });

  it("keeps an unassigned course locked", () => {
    expect(evaluateCourseAccess(base)).toEqual({ allowed: false, reason: "locked" });
  });

  it("opens courses for an account-level premium entitlement", () => {
    expect(evaluateCourseAccess({ ...base, premiumEntitlement: true })).toEqual({ allowed: true, source: "premium" });
  });

  it("allows premium access across levels and offerings", () => {
    expect(
      evaluateCourseAccess({
        ...base,
        sameLevel: false,
        sameOffering: false,
        premiumEntitlement: true
      })
    ).toEqual({ allowed: true, source: "premium" });
  });

  it("does not carry free access into another level", () => {
    expect(evaluateCourseAccess({ ...base, sameLevel: false })).toEqual({ allowed: false, reason: "wrong_level" });
  });

  it("blocks suspended users and authorizes active admins", () => {
    expect(evaluateCourseAccess({ ...base, accountActive: false, admin: true })).toEqual({ allowed: false, reason: "suspended" });
    expect(evaluateCourseAccess({ ...base, admin: true })).toEqual({ allowed: true, source: "admin" });
  });
});
