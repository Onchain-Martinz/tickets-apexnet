import { afterEach, describe, expect, it, vi } from "vitest";

import { createAdminClient } from "@/lib/supabase/admin";

describe("Supabase admin configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects a secret configured with the NEXT_PUBLIC prefix", () => {
    vi.stubEnv("SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_SECRET_KEY", "unsafe-public-placeholder");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    expect(() => createAdminClient()).toThrow(
      "Supabase secret key must use SUPABASE_SECRET_KEY, not NEXT_PUBLIC_SUPABASE_SECRET_KEY."
    );
  });

  it("requires a server-only secret or legacy service-role key", () => {
    vi.stubEnv("SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_SECRET_KEY", "");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    expect(() => createAdminClient()).toThrow("Supabase admin configuration is missing.");
  });

  it("creates a Node 20-safe client without a browser WebSocket", () => {
    vi.stubEnv("SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_SECRET_KEY", "");
    vi.stubEnv("SUPABASE_SECRET_KEY", "server-secret-placeholder");

    expect(() => createAdminClient()).not.toThrow();
  });
});
