import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const home = source("../app/page.tsx");
const returnPage = source("../app/payment/return/page.tsx");
const adminPage = source("../app/admin/page.tsx");
const initRoute = source("../app/api/payments/kora/initialize/route.ts");

describe("route security contracts", () => {
  it("keeps the public party landing page accessible without login", () => {
    expect(home).not.toContain("requireViewer(");
    expect(home).not.toContain("requireAdmin(");
  });

  it("protects the admin dashboard with requireAdmin", () => {
    expect(adminPage).toContain("requireAdmin(");
  });

  it("uses server-side authoritative verifyAndFinalizePayment fallback on return page", () => {
    expect(returnPage).toContain("verifyAndFinalizePayment");
  });

  it("contains no browser-return payment finalization path", () => {
    expect(returnPage).not.toContain("confirmDevelopmentKoraReturn");
    expect(returnPage).not.toContain("developmentReturnFinalizationEnabled");
  });

  it("server-side determines ticket payable price in initialization route", () => {
    expect(initRoute).toContain("calculateOrderEconomics");
    expect(initRoute).toContain("amount_minor: economics.totalMinor");
  });
});

function source(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}
