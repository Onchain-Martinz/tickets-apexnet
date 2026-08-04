import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { completedPastQuestionAnswersByCourse } from "@/lib/data/completed-past-answers";
import { examRecords } from "@/lib/data/exams";
import { generatedPracticeQuestionsByCourse } from "@/lib/data/generated-practice";
import { mapExamRecordToDetail } from "@/lib/mappers/exams";

const generatedCourseCodes = [
  "CSD 102",
  "HIS 104",
  "ELS 102",
  "NPC 112",
  "ICT 102",
  "IGBO 107",
  "GST 212"
];

describe("question content", () => {
  it("stores all supplied AI practice questions separately with complete answers", () => {
    expect(Object.keys(generatedPracticeQuestionsByCourse)).toEqual(generatedCourseCodes);

    const questions = Object.values(generatedPracticeQuestionsByCourse).flatMap(
      (set) => set.questions
    );

    expect(questions).toHaveLength(210);
    expect(questions.every((question) => question.source === "generated_practice")).toBe(true);
    expect(
      questions.every(
        (question) =>
          Object.keys(question.options).join("") === "ABCD" &&
          Boolean(question.options[question.answer])
      )
    ).toBe(true);

    for (const set of Object.values(generatedPracticeQuestionsByCourse)) {
      expect(set.questions.map((question) => question.number)).toEqual(
        Array.from({ length: 30 }, (_, index) => index + 1)
      );
    }
  });

  it("maps each supplied set onto the existing official course without creating past questions", () => {
    for (const courseCode of generatedCourseCodes) {
      const record = examRecords.find((exam) => exam.courseCode === courseCode);
      expect(record, courseCode).toBeDefined();

      const detail = mapExamRecordToDetail(record!);
      expect(detail.generatedPracticeQuestionSet?.title).toBe("AI Practice Questions");
      expect(detail.generatedPracticeQuestionSet?.source).toBe("generated_practice");
      expect(detail.generatedPracticeQuestionSet?.notice).toBe(
        "These are AI-generated practice questions modeled after university examination patterns. They are not official IMSU examination questions."
      );
      expect(detail.generatedPracticeQuestionSet?.questions).toHaveLength(30);
      expect(
        detail.generatedPracticeQuestionSet?.questions.every(
          (question) =>
            question.source === "generated_practice" &&
            question.answerStatus === "available" &&
            question.answer !== null
        )
      ).toBe(true);
    }

    expect(examRecords.find((exam) => exam.courseCode === "GST 212")?.pastQuestions).toBeNull();
  });

  it("completes every previously unanswered past-question set", () => {
    expect(Object.values(completedPastQuestionAnswersByCourse).flat()).toHaveLength(79);

    for (const record of examRecords.filter((exam) => exam.pastQuestions)) {
      const detail = mapExamRecordToDetail(record);
      expect(detail.questionSet?.questions.length, record.courseCode).toBeGreaterThan(0);

      for (const question of detail.questionSet?.questions ?? []) {
        if (question.subQuestions.length) {
          expect(
            question.subQuestions.every((subQuestion) => subQuestion.answer !== null),
            `${record.courseCode} question ${question.number}`
          ).toBe(true);
        } else {
          expect(question.answer, `${record.courseCode} question ${question.number}`).not.toBeNull();
          expect(question.answerStatus).toBe("available");
        }
      }
    }
  });

  it("includes formula, working, and conclusions for calculation answers", () => {
    const calculationAnswers = [
      ...completedPastQuestionAnswersByCourse["PSY 111"].filter((_, index) =>
        [0, 1, 2, 3, 5].includes(index)
      ),
      ...completedPastQuestionAnswersByCourse["PSY 104"].slice(1)
    ];

    for (const answer of calculationAnswers) {
      expect(answer).toContain("Formula:");
      expect(answer).toContain("Working:");
      expect(answer).toMatch(/Therefore|Decision|Final answer|Pie-chart values/);
    }
  });

  it("keeps every answer already supplied for existing past questions", () => {
    const record = examRecords.find((exam) => exam.courseCode === "PSY 115");
    const detail = mapExamRecordToDetail(record!);
    const mappedAnswers = detail.questionSet?.questions.flatMap((question) => [
      ...(question.answer ? [question.answer.text] : []),
      ...question.subQuestions.flatMap((subQuestion) =>
        subQuestion.answer ? [subQuestion.answer.text] : []
      )
    ]);

    expect(mappedAnswers).toEqual(record?.answerReveals?.map((reveal) => reveal.answer));
  });

  it("uses the reusable hidden-answer card for every rendered question type", () => {
    const card = source("../components/exams/question-reveal-card.tsx");
    const panel = source("../components/exams/past-questions-panel.tsx");
    const tabs = source("../components/exams/exam-content-tabs.tsx");

    expect(card).toContain('useState(false)');
    expect(card).toContain('"Hide Answer" : "Reveal Answer"');
    expect(card).toContain('option.key === item.answer?.text');
    expect(card).toContain("Answer under review");
    expect(panel).toContain("displayQuestions.map");
    expect(panel).toContain("<QuestionRevealCard");
    expect(tabs).toContain("AI Practice Questions");
    expect(tabs).toContain("Past Questions");
    expect(tabs).toContain("grid-cols-2");
    expect(tabs).not.toContain('value="generated-practice"');
  });

  it("keeps past, AI-only, and empty courses in one conditional question section", () => {
    const past = mapExamRecordToDetail(
      examRecords.find((exam) => exam.courseCode === "PSY 116")!
    );
    const aiOnly = mapExamRecordToDetail(
      examRecords.find((exam) => exam.courseCode === "CSD 102")!
    );
    const empty = mapExamRecordToDetail(
      examRecords.find((exam) => exam.courseCode === "PSY 208")!
    );

    expect(past.questionSet?.title).toBe("Past Questions");
    expect(past.generatedPracticeQuestionSet).toBeNull();
    expect(aiOnly.questionSet).toBeNull();
    expect(aiOnly.generatedPracticeQuestionSet?.title).toBe("AI Practice Questions");
    expect(empty.questionSet).toBeNull();
    expect(empty.generatedPracticeQuestionSet).toBeNull();
  });
});

function source(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}
