import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createKoraMerchantReference,
  getKoraConfigurationStatus,
  getKoraErrorDiagnostic,
  getKoraNotificationUrl,
  initializeKoraCheckout,
  minorToKoraAmount
} from "@/lib/payments/kora";

describe("Kora checkout initialization", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("accepts live server configuration without requiring a browser public key", () => {
    const status = getKoraConfigurationStatus({
      KORA_SECRET_KEY: "server-secret-placeholder",
      KORA_ENVIRONMENT: " LIVE ",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000"
    });

    expect(status).toMatchObject({
      publicKeyPresent: false,
      secretKeyPresent: true,
      environment: "live",
      environmentValid: true,
      appUrlValid: true,
      configured: true
    });
  });

  it("creates a compact unique reference accepted by the Kora field contract", () => {
    const reference = createKoraMerchantReference(
      1785720000000,
      "12345678-1234-1234-1234-123456789012"
    );

    expect(reference).toBe("PARTY-1785720000000-12345678");
    expect(reference.length).toBeLessThanOrEqual(30);
  });

  it("converts the database minor-unit prices in one place", () => {
    expect(minorToKoraAmount(750000)).toBe(7500);
    expect(minorToKoraAmount(10000)).toBe(100);
  });

  it("omits a localhost webhook but enables the deployed HTTPS endpoint", () => {
    expect(getKoraNotificationUrl("http://localhost:3000")).toBeUndefined();
    expect(getKoraNotificationUrl("https://example.com")).toBe(
      "https://example.com/api/payments/kora/webhook"
    );
  });

  it("returns the checkout URL and omits notification_url when unavailable", async () => {
    vi.stubEnv("KORA_SECRET_KEY", "server-secret-placeholder");
    const request = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          status: true,
          message: "Charge created successfully",
          data: { reference: "PARTY-1-12345678", checkout_url: "https://checkout.korapay.com/pay" }
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", request);

    const checkout = await initializeKoraCheckout({
      merchantReference: "PARTY-1-12345678",
      amountMinor: 750000,
      currency: "NGN",
      customerName: "Alex",
      customerEmail: "party-1-12345678@guest.tickets",
      redirectUrl: "http://localhost:3000/payment/return"
    });
    const body = JSON.parse(request.mock.calls[0][1].body as string);

    expect(checkout.checkoutUrl).toBe("https://checkout.korapay.com/pay");
    expect(body.amount).toBe(7500);
    expect(body).not.toHaveProperty("notification_url");
  });

  it("exposes only sanitized Kora failure diagnostics", async () => {
    vi.stubEnv("KORA_SECRET_KEY", "server-secret-placeholder");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            status: false,
            error: "validation_error",
            message: "One or more fields are invalid.",
            data: { reference: "invalid-value" }
          }),
          { status: 422, headers: { "Content-Type": "application/json" } }
        )
      )
    );

    let diagnostic;
    try {
      await initializeKoraCheckout({
        merchantReference: "invalid-value",
        amountMinor: 750000,
        currency: "NGN",
        customerName: "Alex",
        customerEmail: "party-1@guest.tickets",
        redirectUrl: "http://localhost:3000/payment/return"
      });
    } catch (error) {
      diagnostic = getKoraErrorDiagnostic(error);
    }

    expect(diagnostic).toEqual({
      httpStatus: 422,
      errorCode: "validation_error",
      message: "One or more fields are invalid.",
      invalidFields: ["reference"]
    });
  });
});
