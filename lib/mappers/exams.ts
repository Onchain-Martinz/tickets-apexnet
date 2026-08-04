import {
  AnswerDTO,
  CourseAliasDTO,
  CourseDetailDTO,
  CourseScheduleDTO,
  ExamSittingDTO,
  OutlineDTO,
  QuestionDTO,
  QuestionSetDTO,
  SubQuestionDTO,
  SupportingDataDTO
} from "@/lib/domain/exams";
import { ExamRecord, GeneratedPracticeQuestionSet } from "@/lib/types/exams";
import { compareSittings, parseTimeRange } from "@/lib/utils/dates";

const aliasesByOfficialCode: Record<string, CourseAliasDTO[]> = {
  "PSY 118": [
    {
      code: "PSY 124",
      kind: "materials",
      note: "Course materials were supplied as PSY 124."
    }
  ],
  "ICT 102": [{ code: "ICT 100", kind: "materials" }],
  "ELS 102": [{ code: "ELS 112", kind: "materials" }],
  "CSD 102": [{ code: "CDS 102", kind: "materials" }],
  "IGBO 107": [{ code: "SGB 118", kind: "materials" }],
  "HIS 104": [{ code: "GST 104", kind: "materials" }],
  "NPC 112": [{ code: "GST 112", kind: "materials" }]
};

export function mapExamRecordToSchedule(exam: ExamRecord): CourseScheduleDTO {
  return {
    id: `${exam.session}:${exam.semester}:${exam.slug}`,
    slug: exam.slug,
    courseCode: exam.courseCode,
    aliases: aliasesByOfficialCode[exam.courseCode] ?? [],
    courseTitle: exam.courseTitle,
    level: exam.level,
    session: exam.session,
    semester: exam.semester,
    sittings: mapSittings(exam)
  };
}

export function mapExamRecordToDetail(exam: ExamRecord): CourseDetailDTO {
  return {
    ...mapExamRecordToSchedule(exam),
    status: exam.status,
    note: exam.note ?? null,
    questionSet: mapPastQuestionSet(exam),
    generatedPracticeQuestionSet: mapGeneratedPracticeQuestionSet(exam),
    outline: mapOutline(exam)
  };
}

function mapSittings(exam: ExamRecord): ExamSittingDTO[] {
  const dates = [...new Set([exam.date, ...(exam.additionalExamDates ?? [])].filter(Boolean))] as string[];
  const { startTime, endTime } = parseTimeRange(exam.time);

  return dates
    .sort()
    .map((date, index) => ({
      id: `${exam.slug}-sitting-${index + 1}`,
      label: dates.length > 1 ? `Day ${index + 1}` : "Exam",
      date,
      startTime,
      endTime,
      timeLabel: exam.time,
      venue: exam.examVenue
    }))
    .sort(compareSittings);
}

function mapPastQuestionSet(exam: ExamRecord): QuestionSetDTO | null {
  const sourceItems = exam.pastQuestions?.items ?? [];
  const answerReveals = exam.answerReveals ?? [];

  if (!sourceItems.length && !answerReveals.length) return null;

  const questions = sourceItems.map((text, index) =>
    createQuestion(exam, extractLeadingNumber(text) ?? String(index + 1), text, index)
  );
  const questionsByNumber = new Map(questions.map((question) => [question.number, question]));

  for (const reveal of answerReveals) {
    const relationship = parseQuestionNumber(reveal.questionNumber);
    let question = questionsByNumber.get(relationship.questionNumber);

    if (!question) {
      question = createQuestion(
        exam,
        relationship.questionNumber,
        reveal.question,
        questions.length
      );
      questions.push(question);
      questionsByNumber.set(question.number, question);
    }

    const answer = mapAnswer(exam.slug, String(reveal.questionNumber), reveal.answer);

    if (relationship.subQuestionLabel) {
      question.subQuestions.push(
        mapSubQuestion(
          exam.slug,
          String(reveal.questionNumber),
          relationship.subQuestionLabel,
          reveal.question,
          answer
        )
      );
    } else {
      question.text = reveal.question;
      question.answer = answer;
      question.answerStatus = "available";
    }
  }

  return {
    id: `${exam.slug}-question-set`,
    title: "Past Questions",
    source: "past_question",
    instruction: exam.pastQuestions?.instruction ?? "",
    notice: null,
    questions
  };
}

function mapGeneratedPracticeQuestionSet(exam: ExamRecord): QuestionSetDTO | null {
  const set = exam.generatedPracticeQuestions;
  if (!set?.questions.length) return null;

  return {
    id: `${exam.slug}-generated-practice-question-set`,
    title: "AI Practice Questions",
    source: "generated_practice",
    instruction: "Choose the best answer from options A-D.",
    notice: set.notice,
    questions: set.questions.map((question) => ({
      id: `${exam.slug}-generated-practice-question-${question.number}`,
      number: String(question.number),
      text: question.question,
      sourceText: question.question,
      source: question.source,
      options: mapGeneratedOptions(question.options),
      answerStatus: "available",
      subQuestions: [],
      answer: mapAnswer(
        `${exam.slug}-generated-practice`,
        String(question.number),
        question.answer
      ),
      supportingData: []
    }))
  };
}

function mapGeneratedOptions(options: GeneratedPracticeQuestionSet["questions"][number]["options"]) {
  return (["A", "B", "C", "D"] as const).map((key) => ({
    key,
    text: options[key]
  }));
}

function createQuestion(
  exam: ExamRecord,
  number: string,
  text: string,
  index: number
): QuestionDTO {
  const id = `${exam.slug}-question-${toIdSegment(number)}`;

  return {
    id,
    number,
    text,
    sourceText: text,
    source: "past_question",
    options: [],
    answerStatus: "needs_review",
    subQuestions: [],
    answer: null,
    supportingData:
      exam.supportingData
        ?.filter((table) => table.questionNumber === index + 1)
        .map<SupportingDataDTO>((table, tableIndex) => ({
          id: `${id}-supporting-data-${tableIndex + 1}`,
          questionId: id,
          kind: table.kind,
          title: table.title,
          columns: [...table.columns],
          rows: table.rows.map((row) => [...row])
        })) ?? []
  };
}

function mapSubQuestion(
  slug: string,
  number: string,
  label: string,
  text: string,
  answer: AnswerDTO
): SubQuestionDTO {
  return {
    id: `${slug}-question-${toIdSegment(number)}`,
    label,
    number,
    text,
    answer
  };
}

function mapAnswer(slug: string, questionNumber: string, text: string): AnswerDTO {
  return {
    id: `${slug}-answer-${toIdSegment(questionNumber)}`,
    text
  };
}

function mapOutline(exam: ExamRecord): OutlineDTO {
  const sourceEntries = [...exam.topicsToRead];
  const topics = exam.topicKeyPoints?.length
    ? exam.topicKeyPoints.map((topic, topicIndex) => ({
        id: `${exam.slug}-topic-${topicIndex + 1}`,
        text: topic.topic,
        keyPoints: topic.points.map((point, pointIndex) => ({
          id: `${exam.slug}-topic-${topicIndex + 1}-point-${pointIndex + 1}`,
          text: point
        }))
      }))
    : sourceEntries.map((topic, topicIndex) => ({
        id: `${exam.slug}-topic-${topicIndex + 1}`,
        text: topic,
        keyPoints: []
      }));

  return {
    id: `${exam.slug}-outline`,
    sourceEntries,
    topics
  };
}

function extractLeadingNumber(value: string) {
  return value.match(/^\s*(\d+)/)?.[1] ?? null;
}

function parseQuestionNumber(value: string | number) {
  const text = String(value).trim();
  const match = text.match(/^(\d+)(?:\s*\(([^)]+)\))?/);

  return {
    questionNumber: match?.[1] ?? text,
    subQuestionLabel: match?.[2] ?? null
  };
}

function toIdSegment(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
