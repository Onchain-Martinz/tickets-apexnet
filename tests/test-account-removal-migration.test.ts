import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL(
    "../supabase/migrations/202608030006_remove_hinatalabs_test_account.sql",
    import.meta.url
  ),
  "utf8"
);

describe("HinataLabs test-account removal", () => {
  it("requires the verified production admin to remain active", () => {
    expect(migration).toContain("lower(auth_user.email) = 'martinzkizitto@gmail.com'");
    expect(migration).toContain("profile.role = 'admin'");
    expect(migration).toContain("active_production_admin_not_found");
    expect(migration).toContain("production_admin_changed_during_cleanup");
  });

  it("stops rather than deleting shared or unsettled records", () => {
    expect(migration).toContain("test_account_has_pending_payment");
    expect(migration).toContain("test_account_has_shared_entitlement_dependency");
    expect(migration).toContain("test_account_has_shared_rep_assignment_dependency");
    expect(migration).toContain("test_account_has_commission_dependency");
  });

  it("removes every audited disposable dependency before the auth user", () => {
    const authDelete = migration.indexOf("delete from auth.users");
    for (const deletion of [
      "delete from public.audit_logs",
      "delete from app_private.payment_events",
      "delete from public.commissions",
      "delete from public.course_rep_assignments",
      "delete from public.premium_entitlements",
      "delete from public.free_exam_allocations",
      "delete from public.payments"
    ]) {
      expect(migration.indexOf(deletion)).toBeGreaterThan(-1);
      expect(migration.indexOf(deletion)).toBeLessThan(authDelete);
    }
  });
});
