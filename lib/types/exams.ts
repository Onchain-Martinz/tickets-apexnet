export type QuestionSet = {
  instruction: string;
  items: string[];
};

export type QuestionOptionKey = "A" | "B" | "C" | "D";

export type GeneratedPracticeQuestion = {
  number: number;
  question: string;
  options: Record<QuestionOptionKey, string>;
  answer: QuestionOptionKey;
  source: "generated_practice";
};

export type GeneratedPracticeQuestionSet = {
  providedCourseCode: string;
  sourceNote: string;
  notice: string;
  questions: GeneratedPracticeQuestion[];
};

export type QuestionSupportingData = {
  questionNumber: number;
  kind: "practice_supporting_data";
  title: string;
  columns: string[];
  rows: string[][];
};

export type AnswerReveal = {
  questionNumber: string | number;
  question: string;
  answer: string;
};

export type TopicKeyPoints = {
  topic: string;
  points: string[];
};

export type ExamStatus =
  | "current"
  | "archived"
  | "awaiting confirmation"
  | "confirmed"
  | "confirmed_schedule_code_pending";

export type ExamRecord = {
  slug: string;
  courseCode: string;
  courseTitle: string;
  session: string;
  semester: string;
  level: string;
  status: ExamStatus;
  date: string | null;
  additionalExamDates?: string[];
  time: string | null;
  examVenue: string | null;
  note?: string;
  pastQuestions: QuestionSet | null;
  generatedPracticeQuestions?: GeneratedPracticeQuestionSet;
  supportingData?: QuestionSupportingData[];
  topicsToRead: string[];
  answerReveals?: AnswerReveal[];
  topicKeyPoints?: TopicKeyPoints[];
};

export type ScheduledExamRecord = ExamRecord & {
  date: string;
  time: string;
};
