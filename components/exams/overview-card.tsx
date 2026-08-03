import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpcomingExamDTO } from "@/lib/domain/exams";

type OverviewCardProps = {
  totalCourses: number;
  examsLeft: number;
  nextExam: UpcomingExamDTO | null;
};

export function OverviewCard({
  totalCourses,
  examsLeft,
  nextExam
}: OverviewCardProps) {
  const items = [
    { label: "Total courses", value: String(totalCourses) },
    { label: "Exams left", value: String(examsLeft) },
    {
      label: "Upcoming exam",
      value: nextExam?.schedule.courseCode ?? "All exams done",
      note: nextExam?.schedule.courseTitle ?? "No upcoming exams"
    }
  ];

  return (
    <Card>
      <CardHeader className="space-y-0.5 pb-3">
        <CardTitle className="text-[15px]">Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 pt-0">
        {items.map((item) => (
          <div
            key={item.label}
            className="border-t border-border/80 py-2 first:border-t-0 first:pt-0 last:pb-0"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-1 text-sm font-semibold tracking-[-0.02em] text-foreground sm:text-[15px]">
              {item.value}
            </p>
            {"note" in item ? (
              <p className="mt-0.5 text-[13px] text-muted-foreground">{item.note}</p>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
