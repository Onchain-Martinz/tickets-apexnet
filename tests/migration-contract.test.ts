import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL("../supabase/migrations/202608030001_mvp_backend.sql", import.meta.url),
  "utf8"
);

describe("MVP database transaction contracts", () => {
  it("repeated onboarding returns immutable existing assignments", () => {
    expect(migration).toContain("where id = p_user_id for update");
    expect(migration).toContain("if v_profile.onboarding_completed_at is not null then");
    expect(migration).toContain("unique (user_id, cohort_id, assignment_position)");
  });

  it("rejects an inactive or missing cohort before writing allocations", () => {
    const onboarding = functionBody("public.complete_onboarding", "public.finalize_verified_payment");
    expect(onboarding).toContain("where id = p_cohort_id and status = 'active'");
    expect(onboarding).toContain("raise exception 'active_cohort_not_found'");
    expect(onboarding.indexOf("raise exception 'active_cohort_not_found'")).toBeLessThan(
      onboarding.indexOf("insert into public.free_exam_allocations")
    );
  });

  it("validates the complete allocation payload before any transactional write", () => {
    const onboarding = functionBody("public.complete_onboarding", "public.finalize_verified_payment");
    expect(onboarding).toContain("raise exception 'invalid_allocation_snapshot'");
    expect(onboarding).toContain("raise exception 'duplicate_allocation_course'");
    expect(onboarding).toContain("raise exception 'duplicate_allocation_position'");
    expect(onboarding.indexOf("raise exception 'invalid_allocation_snapshot'")).toBeLessThan(
      onboarding.indexOf("insert into public.free_exam_allocations")
    );
    expect(onboarding.indexOf("insert into public.free_exam_allocations")).toBeLessThan(
      onboarding.indexOf("update public.profiles")
    );
  });

  it("a verified payment creates a premium entitlement", () => {
    expect(migration).toContain("insert into public.premium_entitlements (user_id, cohort_id, source, payment_id)");
    expect(migration).toContain("values (v_payment.user_id, v_cohort_id, 'payment', v_payment.id)");
  });

  it("a duplicate webhook cannot create another entitlement", () => {
    expect(migration).toContain("if v_payment.status = 'successful' then return v_payment");
    expect(migration).toContain("premium_entitlements_one_active_per_cohort");
  });

  it("a duplicate webhook cannot create another commission", () => {
    expect(migration).toContain("payment_id uuid not null unique references public.payments(id)");
    expect(migration).toContain("on conflict (payment_id) do nothing");
  });

  it("a payment without an active representative creates no commission", () => {
    expect(migration).toContain("where cohort_id = v_cohort_id and status = 'active'");
    expect(migration).toContain("if found then");
  });

  it("locks payment initialization to one pending attempt per plan", () => {
    expect(migration).toContain("payments_one_pending_per_user_plan");
  });

  it("does not grant browser roles or allocation writes", () => {
    expect(migration).toContain("revoke execute on function public.complete_onboarding");
    expect(migration).not.toContain("grant insert on public.free_exam_allocations to authenticated");
  });

  it("does not recalculate allocations during an admin level correction", () => {
    const levelFunction = migration.slice(
      migration.indexOf("create or replace function public.admin_correct_level"),
      migration.indexOf("create or replace function public.admin_replace_free_allocations")
    );
    expect(levelFunction).not.toContain("free_exam_allocations");
  });
});

function functionBody(start: string, end: string) {
  return migration.slice(
    migration.indexOf(`create or replace function ${start}`),
    migration.indexOf(`create or replace function ${end}`)
  );
}
