import { createHmac } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  getKoraReferenceCandidates,
  verifyKoraWebhookSignature
} from "@/lib/payments/kora-signature";
import { calculateCommission, verifiedPaymentMatches } from "@/lib/payments/rules";

const expected = {
  merchantReference: "IMSU-001",
  amountMinor: 100000,
  currency: "NGN"
};

describe("payment verification rules", () => {
  it("accepts an exact successful verification", () => {
    expect(verifiedPaymentMatches(expected, { ...expected, successful: true })).toBe(true);
  });

  it("rejects wrong amount, wrong currency, and failed status", () => {
    expect(verifiedPaymentMatches(expected, { ...expected, amountMinor: 99900, successful: true })).toBe(false);
    expect(verifiedPaymentMatches(expected, { ...expected, currency: "USD", successful: true })).toBe(false);
    expect(verifiedPaymentMatches(expected, { ...expected, successful: false })).toBe(false);
  });

  it("rejects an invalid webhook signature", () => {
    expect(verifyKoraWebhookSignature({ reference: "IMSU-001" }, "bad", "secret")).toBe(false);
  });

  it("accepts the documented HMAC signature for the data object", () => {
    const data = { reference: "IMSU-001", amount: 1000 };
    const signature = createHmac("sha256", "secret").update(JSON.stringify(data)).digest("hex");
    expect(verifyKoraWebhookSignature(data, signature, "secret")).toBe(true);
  });

  it("prefers the documented merchant payment reference and keeps the provider reference as fallback", () => {
    expect(getKoraReferenceCandidates({
      reference: "KPY-provider-reference",
      payment_reference: "IMSU-merchant-reference"
    })).toEqual(["IMSU-merchant-reference", "KPY-provider-reference"]);
    expect(getKoraReferenceCandidates({ reference: "IMSU-only-reference" })).toEqual([
      "IMSU-only-reference"
    ]);
  });

  it("calculates a 50 percent commission", () => {
    expect(calculateCommission(100000, 5000)).toBe(50000);
  });
});
