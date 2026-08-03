import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  buildCompleteOnboardingRpcArgs,
  buildOnboardingAllocationPayload,
  onboardingAllocationFields
} from "@/lib/access/onboarding-payload";
import type { FreeAssignmentCandidate } from "@/lib/access/free-assignments";

const migration = readFileSync(
  new URL("../supabase/migrations/202608030001_mvp_backend.sql", import.meta.url),
  "utf8"
);

describe("onboarding RPC payload", () => {
  it("matches the PostgreSQL argument and JSON record field names exactly", () => {
    const payload = buildOnboardingAllocationPayload([assignment()]);
    const args = buildCompleteOnboardingRpcArgs("user-id", "cohort-id", payload);
    const sqlFields = extractJsonRecordFields(migration);

    expect(Object.keys(args)).toEqual(["p_user_id", "p_cohort_id", "p_allocations"]);
    expect(Object.keys(payload[0])).toEqual(onboardingAllocationFields);
    expect(sqlFields).toEqual(onboardingAllocationFields);
  });

  it("preserves a valid ISO timestamp for PostgreSQL timestamptz", () => {
    const payload = buildOnboardingAllocationPayload([assignment()]);
    expect(payload[0].next_sitting_at).toBe("2026-08-12T14:00:00.000Z");
  });

  it("rejects an invalid allocation timestamp before the RPC", () => {
    expect(() =>
      buildOnboardingAllocationPayload([
        { ...assignment(), nextSittingAt: "not-a-timestamp" }
      ])
    ).toThrow("Invalid onboarding allocation timestamp.");
  });
});

function assignment(): FreeAssignmentCandidate {
  return {
    courseSlug: "psy-116",
    courseCode: "PSY 116",
    courseTitle: "History and Systems of Psychology",
    level: "100-level",
    academicSession: "2025/2026",
    semester: "Second Semester",
    assignmentPosition: 1,
    nextSittingAt: "2026-08-12T14:00:00.000Z"
  };
}

function extractJsonRecordFields(sql: string) {
  const functionStart = sql.indexOf("create or replace function public.complete_onboarding");
  const recordsetStart = sql.indexOf("jsonb_to_recordset(p_allocations) as item(", functionStart);
  const fieldsStart = recordsetStart + "jsonb_to_recordset(p_allocations) as item(".length;
  const fieldsEnd = sql.indexOf(")\n    where", fieldsStart);

  return sql
    .slice(fieldsStart, fieldsEnd)
    .split(",")
    .map((field) => field.trim().split(/\s+/)[0]);
}
