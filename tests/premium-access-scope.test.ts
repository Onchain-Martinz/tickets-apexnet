import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

describe("account-level premium access", () => {
  it("looks up an active entitlement by user rather than cohort", () => {
    const authorization = source("../lib/access/authorization.ts");
    const entitlementQuery = authorization.slice(
      authorization.indexOf('.from("premium_entitlements")'),
      authorization.indexOf("if (entitlement)")
    );

    expect(entitlementQuery).toContain('.eq("user_id", profile.id)');
    expect(entitlementQuery).not.toContain('.eq("cohort_id"');
  });

  it("does not initialize another payment when any account entitlement is active", () => {
    const initialization = source("../app/api/payments/kora/initialize/route.ts");
    const entitlementQuery = initialization.slice(
      initialization.indexOf("const { data: existingEntitlement }"),
      initialization.indexOf("if (existingEntitlement)")
    );

    expect(entitlementQuery).toContain('.eq("user_id", profile.id)');
    expect(entitlementQuery).not.toContain('.eq("cohort_id"');
  });

  it("offers checkout for locked courses outside the free user's cohort", () => {
    const examPage = source("../app/exam/[slug]/page.tsx");

    expect(examPage).toContain('access.reason === "wrong_level"');
    expect(examPage).toContain('access.reason === "wrong_offering"');
    expect(examPage).toContain("<PremiumPaywall");
  });
});
