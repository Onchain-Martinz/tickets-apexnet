import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL(
    "../supabase/migrations/202608030004_migrate_production_admin.sql",
    import.meta.url
  ),
  "utf8"
);

describe("production admin migration", () => {
  it("requires the verified production Google account before promoting it", () => {
    expect(migration).toContain("martinzkizitto@gmail.com");
    expect(migration).toContain("auth_user.email_confirmed_at is not null");
    expect(migration).toContain("verified_production_admin_not_found");
    expect(migration).toContain("set role = 'admin', account_status = 'active'");
  });

  it("preserves the old account and its dependencies while removing its admin role", () => {
    expect(migration).toContain("hinatalabs.co@gmail.com");
    expect(migration).toContain("set role = 'student'");
    expect(migration).not.toContain("delete from public.profiles");
    expect(migration).not.toContain("delete from auth.users");
  });
});
