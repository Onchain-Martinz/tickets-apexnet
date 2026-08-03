import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

describe("course representative assignment", () => {
  it("derives the cohort from the selected user's profile", () => {
    const action = source("../app/admin/actions.ts");
    const assignment = action.slice(
      action.indexOf("export async function assignCourseRepAction"),
      action.indexOf("export async function removeCourseRepAction")
    );

    expect(assignment).toContain('.select("cohort_id")');
    expect(assignment).toContain("p_cohort_id: cohort.id");
    expect(assignment).not.toContain('required(formData, "cohort_id")');
  });

  it("submits the user and a clearly labeled commission percentage", () => {
    const page = source("../app/admin/page.tsx");
    const section = page.slice(
      page.indexOf("<CardHeader><CardTitle>Course representatives"),
      page.indexOf("<CardHeader><CardTitle>Payments and commissions")
    );

    expect(section).toContain('name="user_id"');
    expect(section).toContain("Commission percentage");
    expect(section).toContain('name="commission_percentage"');
    expect(section).not.toContain('name="cohort_id"');
  });
});
