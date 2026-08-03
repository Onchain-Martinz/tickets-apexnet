import { afterEach, describe, expect, it, vi } from "vitest";

import { getAppUrl } from "@/lib/auth/app-url";

describe("production application origin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("requires an explicit public HTTPS origin in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    expect(() => getAppUrl()).toThrow("NEXT_PUBLIC_APP_URL is required in production.");

    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    expect(() => getAppUrl()).toThrow(
      "NEXT_PUBLIC_APP_URL must be a public HTTPS origin in production."
    );
  });

  it("normalizes a production URL to its origin", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://exam.example.com/path");

    expect(getAppUrl()).toBe("https://exam.example.com");
  });
});
