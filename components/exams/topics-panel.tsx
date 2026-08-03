import { TopicKeyPointsItem } from "@/components/exams/topic-key-points-item";
import { Card, CardContent } from "@/components/ui/card";
import { OutlineDTO } from "@/lib/domain/exams";

export function TopicsPanel({ outline }: { outline: OutlineDTO }) {
  const hasTopicKeyPoints = outline.topics.some((topic) => topic.keyPoints.length > 0);

  if (!outline.topics.length) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-5">
          <p className="text-sm leading-6 text-muted-foreground">
            Topics to read will be added here.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (hasTopicKeyPoints) {
    return (
      <div className="space-y-2.5 sm:space-y-3">
        {outline.topics.map((item) => (
          <TopicKeyPointsItem key={item.id} item={item} />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="space-y-4">
          {outline.topics.map((topic) => (
            <pre
              key={topic.id}
              className="max-w-3xl whitespace-pre-wrap break-words font-sans text-sm leading-6 text-foreground"
            >
              {topic.text}
            </pre>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
