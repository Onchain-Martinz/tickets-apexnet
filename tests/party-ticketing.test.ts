import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  EVENT_CONFIG,
  PRODUCTION_CONFIG_PRESET,
  TICKET_PRICE_DISPLAY,
  PROCESSING_FEE_DISPLAY,
  CUSTOMER_TOTAL_DISPLAY,
  ORGANIZER_PROCEEDS_PER_TICKET_DISPLAY
} from "@/lib/config/event";
import {
  createKoraMerchantReference,
  minorToKoraAmount
} from "@/lib/payments/kora";
import { verifiedPaymentMatches } from "@/lib/payments/rules";

const migration = readFileSync(
  new URL("../supabase/migrations/202610010001_party_ticketing.sql", import.meta.url),
  "utf8"
);

describe("Party Ticketing Contract & Test Economics", () => {
  it("converts minor units accurately for both production preset (₦7,500) and test mode (₦200)", () => {
    expect(minorToKoraAmount(750000)).toBe(7500);
    expect(minorToKoraAmount(700000)).toBe(7000);
    expect(minorToKoraAmount(50000)).toBe(500);
    expect(minorToKoraAmount(20000)).toBe(200);
    expect(minorToKoraAmount(15000)).toBe(150);
    expect(minorToKoraAmount(5000)).toBe(50);
    expect(minorToKoraAmount(EVENT_CONFIG.customerTotalMinor)).toBe(
      EVENT_CONFIG.customerTotalMinor / 100
    );
  });

  it("strictly enforces active ₦200 test mode and preserves production preset", () => {
    // Active Test Mode values
    expect(EVENT_CONFIG.isTestMode).toBe(true);
    expect(EVENT_CONFIG.name).toBe("Course Representatives' Party Night");
    expect(EVENT_CONFIG.ticketPriceMinor).toBe(15000);
    expect(EVENT_CONFIG.processingFeeMinor).toBe(5000);
    expect(EVENT_CONFIG.customerTotalMinor).toBe(20000);
    expect(TICKET_PRICE_DISPLAY).toBe("₦150");
    expect(PROCESSING_FEE_DISPLAY).toBe("₦50");
    expect(CUSTOMER_TOTAL_DISPLAY).toBe("₦200");
    expect(EVENT_CONFIG.date).toBe("TBA");
    expect(EVENT_CONFIG.time).toBe("TBA");
    expect(EVENT_CONFIG.venue).toBe("TBA");

    // Preserved Production Preset values for future switch
    expect(PRODUCTION_CONFIG_PRESET.ticketPriceMinor).toBe(700000);
    expect(PRODUCTION_CONFIG_PRESET.processingFeeMinor).toBe(50000);
    expect(PRODUCTION_CONFIG_PRESET.customerTotalMinor).toBe(750000);
    expect(PRODUCTION_CONFIG_PRESET.organizerProceedsMinor).toBe(710000);
  });

  it("generates PARTY- prefixed merchant references with entropy", () => {
    const ref = createKoraMerchantReference(1785720000000, "abcdef12-3456-7890-abcd-ef1234567890");
    expect(ref.startsWith("PARTY-") || ref.startsWith("PARTY-TEST-")).toBe(true);
  });

  it("strictly validates payment verification match rules", () => {
    const expected = {
      merchantReference: "PARTY-123",
      amountMinor: 20000,
      currency: "NGN"
    };

    expect(
      verifiedPaymentMatches(expected, {
        ...expected,
        successful: true
      })
    ).toBe(true);

    expect(
      verifiedPaymentMatches(expected, {
        ...expected,
        amountMinor: 15000,
        successful: true
      })
    ).toBe(false);

    expect(
      verifiedPaymentMatches(expected, {
        ...expected,
        successful: false
      })
    ).toBe(false);
  });

  it("party ticketing migration adapts payments and isolates fulfillment from exam logic", () => {
    expect(migration).toContain("alter table public.payments alter column user_id drop not null");
    expect(migration).toContain("ticket_number");
    expect(migration).toContain("organizer_proceeds_minor");
    expect(migration).toContain("finalize_verified_payment");
    expect(migration).not.toContain("premium_entitlements");
    expect(migration).not.toContain("course_rep_assignments");
  });
});
