export const levelOptions = [
  {
    key: "100-level",
    label: "100 LEVEL",
    level: "100 Level"
  },
  {
    key: "200-level",
    label: "200 LEVEL",
    level: "200 Level"
  }
] as const;

export type LevelKey = (typeof levelOptions)[number]["key"];

export const defaultLevelKey: LevelKey = "100-level";

export type CourseOfferingStatus =
  | "current"
  | "archived"
  | "awaiting confirmation"
  | "confirmed"
  | "confirmed_schedule_code_pending";

export type CourseAliasDTO = {
  code: string;
  kind: "materials" | "legacy";
  note?: string;
};

export type ExamSittingDTO = {
  id: string;
  label: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  timeLabel: string | null;
  venue: string | null;
};

export type CourseScheduleDTO = {
  id: string;
  slug: string;
  courseCode: string;
  aliases: CourseAliasDTO[];
  courseTitle: string;
  level: string;
  session: string;
  semester: string;
  sittings: ExamSittingDTO[];
};

export type AnswerDTO = {
  id: string;
  text: string;
};

export type QuestionSource = "past_question" | "generated_practice";

export type QuestionOptionDTO = {
  key: "A" | "B" | "C" | "D";
  text: string;
};

export type SupportingDataDTO = {
  id: string;
  questionId: string;
  kind: "practice_supporting_data";
  title: string;
  columns: string[];
  rows: string[][];
};

export type SubQuestionDTO = {
  id: string;
  label: string;
  number: string;
  text: string;
  answer: AnswerDTO | null;
};

export type QuestionDTO = {
  id: string;
  number: string;
  text: string;
  sourceText: string;
  source: QuestionSource;
  options: QuestionOptionDTO[];
  answerStatus: "available" | "needs_review";
  subQuestions: SubQuestionDTO[];
  answer: AnswerDTO | null;
  supportingData: SupportingDataDTO[];
};

export type QuestionSetDTO = {
  id: string;
  title: "Past Questions" | "AI Practice Questions";
  source: QuestionSource;
  instruction: string;
  notice: string | null;
  questions: QuestionDTO[];
};

export type KeyPointDTO = {
  id: string;
  text: string;
};

export type OutlineTopicDTO = {
  id: string;
  text: string;
  keyPoints: KeyPointDTO[];
};

export type OutlineDTO = {
  id: string;
  sourceEntries: string[];
  topics: OutlineTopicDTO[];
};

export type CourseDetailDTO = CourseScheduleDTO & {
  status: CourseOfferingStatus;
  note: string | null;
  questionSet: QuestionSetDTO | null;
  generatedPracticeQuestionSet: QuestionSetDTO | null;
  outline: OutlineDTO;
};

export type UpcomingExamDTO = {
  schedule: CourseScheduleDTO;
  sitting: ExamSittingDTO;
};

export function isLevelKey(value: string | undefined): value is LevelKey {
  return levelOptions.some((level) => level.key === value);
}

export function getLevelKey(exam: Pick<CourseScheduleDTO, "level">): LevelKey {
  return levelOptions.find((level) => level.level === exam.level)?.key ?? defaultLevelKey;
}
