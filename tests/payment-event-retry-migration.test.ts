import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL(
    "../supabase/migrations/202608030005_retry_failed_payment_events.sql",
    import.meta.url
  ),
  "utf8"
);

describe("payment event retry migration", () => {
  it("reacquires failed or stale events without reprocessing completed duplicates", () => {
    expect(migration).toContain("on conflict (event_key) do update");
    expect(migration).toContain("payment_events.processing_error is not null");
    expect(migration).toContain("payment_events.processed_at is null");
    expect(migration).toContain("interval '5 minutes'");
    expect(migration).not.toContain("payment_events.processed_at is not null");
  });

  it("keeps the retry function restricted to the service role", () => {
    expect(migration).toContain("from public, anon, authenticated");
    expect(migration).toContain("to service_role");
  });
});
