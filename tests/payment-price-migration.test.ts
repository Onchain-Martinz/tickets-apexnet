import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const temporaryMigration = readFileSync(
  new URL(
    "../supabase/migrations/202608030002_set_temporary_payment_price.sql",
    import.meta.url
  ),
  "utf8"
);
const productionMigration = readFileSync(
  new URL(
    "../supabase/migrations/202608030003_restore_production_price.sql",
    import.meta.url
  ),
  "utf8"
);
const paywall = readFileSync(
  new URL("../components/payments/premium-paywall.tsx", import.meta.url),
  "utf8"
);

describe("production premium price", () => {
  it("preserves the historical test-price migration and restores ₦1,500 later", () => {
    expect(temporaryMigration).toContain("amount_minor = 10000");
    expect(productionMigration).toContain("amount_minor = 150000");
    expect(productionMigration).toContain("Premium Platform Access");
  });

  it("invalidates mismatched pending checkouts before changing the production plan", () => {
    expect(productionMigration.indexOf("update public.payments")).toBeLessThan(
      productionMigration.indexOf("update public.premium_plans")
    );
    expect(productionMigration).toContain("payment.status = 'pending'");
    expect(productionMigration).toContain("payment.amount_minor <> 150000");
  });

  it("renders the paywall from the database plan instead of a hardcoded price", () => {
    expect(paywall).toContain("plan.amountMinor / 100");
    expect(paywall).not.toContain("₦1,000");
    expect(paywall).not.toContain("₦100");
  });
});
