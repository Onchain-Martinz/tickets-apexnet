import { QuestionRevealCard } from "@/components/exams/question-reveal-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AnswerDTO,
  QuestionSetDTO,
  SupportingDataDTO
} from "@/lib/domain/exams";

type QuestionDisplayItem = {
  id: string;
  number: string;
  text: string;
  source: QuestionSetDTO["source"];
  options: QuestionSetDTO["questions"][number]["options"];
  answer: AnswerDTO | null;
  answerStatus: "available" | "needs_review";
  supportingData: SupportingDataDTO[];
};

export function PastQuestionsPanel({
  questionSet
}: {
  questionSet: QuestionSetDTO | null;
}) {
  const displayQuestions = questionSet?.questions.flatMap<QuestionDisplayItem>((question) => {
    if (question.subQuestions.length) {
      return question.subQuestions.map((subQuestion, index) => ({
        id: subQuestion.id,
        number: subQuestion.number,
        text: subQuestion.text,
        source: question.source,
        options: [],
        answer: subQuestion.answer,
        answerStatus: subQuestion.answer ? "available" : "needs_review",
        supportingData: index === 0 ? question.supportingData : []
      }));
    }

    return [{
      id: question.id,
      number: question.number,
      text: question.text,
      source: question.source,
      options: question.options,
      answer: question.answer,
      answerStatus: question.answerStatus,
      supportingData: question.supportingData
    }];
  }) ?? [];

  if (!questionSet) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-5">
          <p className="text-sm leading-6 text-muted-foreground">
            No past questions provided for this course.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <header className="space-y-1.5 px-1">
        <h2 className="text-lg font-semibold tracking-[-0.025em] text-foreground sm:text-xl">
          {questionSet.title}
        </h2>
        {questionSet.notice ? (
          <p className="max-w-3xl text-[13px] leading-5 text-muted-foreground sm:text-sm sm:leading-6">
            {questionSet.notice}
          </p>
        ) : null}
      </header>

      {questionSet.instruction ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px]">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {questionSet.instruction}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-2.5 sm:space-y-3">
        {displayQuestions.map((item) => (
          <QuestionRevealCard key={item.id} item={item}>
            {item.supportingData.map((table) => (
              <PracticeSupportingTable key={table.id} table={table} />
            ))}
          </QuestionRevealCard>
        ))}
      </div>
    </div>
  );
}

function PracticeSupportingTable({ table }: { table: SupportingDataDTO }) {
  return (
    <section
      data-supporting-data-kind={table.kind}
      className="mt-4 border-t border-border/70 pt-4"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/80">
        Practice supporting data
      </p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Provided for practice; not part of the supplied official question image.
      </p>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{table.title}</h3>

      <div className="mt-2 overflow-x-auto rounded-[0.85rem] border border-border/70">
        <table className="w-full min-w-max border-collapse text-left text-sm">
          <thead className="bg-muted/45 text-foreground">
            <tr>
              {table.columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="border-b border-border/70 px-3 py-2 font-semibold"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={`${table.id}-${rowIndex}`} className="border-b border-border/60 last:border-b-0">
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`} className="px-3 py-2 text-foreground">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
