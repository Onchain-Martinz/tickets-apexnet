import { describe, expect, it } from "vitest";

import { selectFreeExamAssignments } from "@/lib/access/free-assignments";
import type { CourseScheduleDTO } from "@/lib/domain/exams";
import { listExamsByLevel } from "@/lib/repositories/exams";

describe("automatic free exam assignment", () => {
  it("assigns PSY 116 and PSY 122 for an August 3 100 Level account", async () => {
    const schedules = await listExamsByLevel("100-level");
    const selected = selectFreeExamAssignments(
      schedules,
      "2026-08-03T03:07:07+01:00",
      "100-level"
    );
    expect(selected.map((item) => item.courseCode)).toEqual(["PSY 116", "PSY 122"]);
  });

  it("assigns PSY 204 and PSY 206 for an August 3 200 Level account", async () => {
    const schedules = await listExamsByLevel("200-level");
    const selected = selectFreeExamAssignments(
      schedules,
      "2026-08-03T03:07:07+01:00",
      "200-level"
    );
    expect(selected.map((item) => item.courseCode)).toEqual(["PSY 204", "PSY 206"]);
  });

  it("assigns PSY 116 and PSY 122 for an August 7 100 Level account", async () => {
    const schedules = await listExamsByLevel("100-level");
    const selected = selectFreeExamAssignments(
      schedules,
      "2026-08-07T00:00:00+01:00",
      "100-level"
    );
    expect(selected.map((item) => item.courseCode)).toEqual(["PSY 116", "PSY 122"]);
  });

  it("assigns PSY 118 and PSY 104 for an August 20 100 Level account", async () => {
    const schedules = await listExamsByLevel("100-level");
    const selected = selectFreeExamAssignments(
      schedules,
      "2026-08-20T00:00:00+01:00",
      "100-level"
    );
    expect(selected.map((item) => item.courseCode)).toEqual(["PSY 118", "PSY 104"]);
  });

  it("counts a multi-day course once and uses its next remaining sitting", () => {
    const ict = schedule("ICT 102", ["2026-09-07T08:00", "2026-09-08T08:00"]);
    const selected = selectFreeExamAssignments(
      [ict],
      "2026-09-07T09:00:00+01:00",
      "100-level"
    );
    expect(selected).toHaveLength(1);
    expect(selected[0].courseCode).toBe("ICT 102");
    expect(selected[0].nextSittingAt).toBe("2026-09-08T07:00:00.000Z");
  });

  it("keeps same-day courses separate and orders by time then course code", () => {
    const later = schedule("AAA 100", ["2026-08-10T12:00"]);
    const tieB = schedule("BBB 100", ["2026-08-10T08:00"]);
    const tieA = schedule("AAC 100", ["2026-08-10T08:00"]);
    const selected = selectFreeExamAssignments(
      [later, tieB, tieA],
      "2026-08-09T00:00:00+01:00",
      "100-level"
    );
    expect(selected.map((item) => item.courseCode)).toEqual(["AAC 100", "BBB 100"]);
  });

  it("assigns only the available future course", () => {
    const past = schedule("OLD 100", ["2026-08-01T08:00"]);
    const future = schedule("NEW 100", ["2026-08-10T08:00"]);
    const selected = selectFreeExamAssignments(
      [past, future],
      "2026-08-09T00:00:00+01:00",
      "100-level"
    );
    expect(selected.map((item) => item.courseCode)).toEqual(["NEW 100"]);
  });
});

function schedule(code: string, dates: string[]): CourseScheduleDTO {
  return {
    id: code,
    slug: code.toLowerCase().replace(/\s+/g, "-"),
    courseCode: code,
    aliases: [],
    courseTitle: code,
    level: "100 Level",
    session: "2025/2026",
    semester: "Second Semester",
    sittings: dates.map((value, index) => {
      const [date, startTime] = value.split("T");
      return {
        id: `${code}-${index}`,
        label: `Day ${index + 1}`,
        date,
        startTime,
        endTime: null,
        timeLabel: startTime,
        venue: null
      };
    })
  };
}
