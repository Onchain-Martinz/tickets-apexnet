import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { getKoraConfigurationStatus } from "@/lib/payments/kora";

const environmentExample = readFileSync(
  new URL("../.env.example", import.meta.url),
  "utf8"
);

describe("Kora webhook enforcement policy", () => {
  it("accepts only live HTTPS webhook-enforced production configuration", () => {
    expect(getKoraConfigurationStatus({
      NODE_ENV: "production",
      NEXT_PUBLIC_APP_URL: "https://exam.example.com",
      KORA_SECRET_KEY: "server-secret-placeholder",
      KORA_ENVIRONMENT: "live",
      KORA_WEBHOOK_REQUIRED: "true"
    })).toMatchObject({
      webhookRequired: true,
      webhookPolicyValid: true,
      environmentValid: true,
      appUrlValid: true,
      configured: true
    });
    expect(environmentExample).toContain("KORA_WEBHOOK_REQUIRED=true");
  });

  it("rejects disabled webhooks in production", () => {
    expect(getKoraConfigurationStatus({
      NODE_ENV: "production",
      NEXT_PUBLIC_APP_URL: "https://exam.example.com",
      KORA_SECRET_KEY: "server-secret-placeholder",
      KORA_ENVIRONMENT: "live",
      KORA_WEBHOOK_REQUIRED: "false"
    })).toMatchObject({ webhookPolicyValid: false, configured: false });
  });

  it("rejects test mode and localhost in production", () => {
    expect(getKoraConfigurationStatus({
      NODE_ENV: "production",
      NEXT_PUBLIC_APP_URL: "https://exam.example.com",
      KORA_SECRET_KEY: "server-secret-placeholder",
      KORA_ENVIRONMENT: "test",
      KORA_WEBHOOK_REQUIRED: "true"
    }).configured).toBe(false);
    expect(getKoraConfigurationStatus({
      NODE_ENV: "production",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      KORA_SECRET_KEY: "server-secret-placeholder",
      KORA_ENVIRONMENT: "live",
      KORA_WEBHOOK_REQUIRED: "true"
    }).configured).toBe(false);
  });

  it("allows test mode in production when ENABLE_TEST_PAYMENT_MODE is enabled", () => {
    expect(getKoraConfigurationStatus({
      NODE_ENV: "production",
      NEXT_PUBLIC_APP_URL: "https://exam.example.com",
      KORA_SECRET_KEY: "server-secret-placeholder",
      KORA_ENVIRONMENT: "test",
      KORA_WEBHOOK_REQUIRED: "true",
      ENABLE_TEST_PAYMENT_MODE: "true"
    }).configured).toBe(true);
  });

  it("defaults to requiring webhooks", () => {
    expect(getKoraConfigurationStatus({
      NODE_ENV: "production",
      NEXT_PUBLIC_APP_URL: "https://exam.example.com",
      KORA_SECRET_KEY: "server-secret-placeholder",
      KORA_ENVIRONMENT: "live"
    }).webhookRequired).toBe(true);
  });
});
