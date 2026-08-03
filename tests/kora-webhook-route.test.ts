import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const route = readFileSync(
  new URL("../app/api/payments/kora/webhook/route.ts", import.meta.url),
  "utf8"
);

describe("Kora webhook route security", () => {
  it("rejects invalid signatures before creating an admin client or recording an event", () => {
    const signatureGuard = route.indexOf("if (!signatureValid)");

    expect(signatureGuard).toBeGreaterThan(-1);
    expect(signatureGuard).toBeLessThan(route.indexOf("admin = createAdminClient()"));
    expect(signatureGuard).toBeLessThan(route.indexOf('admin.rpc("record_payment_event"'));
  });

  it("limits public webhook payload size", () => {
    expect(route).toContain("MAX_WEBHOOK_BYTES");
    expect(route).toContain("status: 413");
  });

  it("resolves both merchant and provider references against stored payments", () => {
    expect(route).toContain('for (const column of ["merchant_reference", "provider_reference"]');
    expect(route).toContain("resolveMerchantReference(admin, referenceCandidates)");
  });

  it("does not acknowledge failed database writes as processed", () => {
    expect(route).toContain("if (paymentError) throw paymentError");
    expect(route).toContain("if (finishError) throw finishError");
  });
});
