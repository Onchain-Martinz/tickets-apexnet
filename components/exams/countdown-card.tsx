import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpcomingExamDTO } from "@/lib/domain/exams";

type CountdownCardProps = {
  nextExam: UpcomingExamDTO | null;
  millisecondsRemaining: number;
};

export function CountdownCard({ nextExam, millisecondsRemaining }: CountdownCardProps) {
  const days = Math.floor(millisecondsRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((millisecondsRemaining / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((millisecondsRemaining / (1000 * 60)) % 60);
  const seconds = Math.floor((millisecondsRemaining / 1000) % 60);
  const formatted = [days, hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(" : ");
  const countdownKey = nextExam
    ? `${nextExam.sitting.id}:${formatted}`
    : "completed";

  return (
    <Card>
      <CardHeader className="space-y-0.5 pb-2.5">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-[15px]">Countdown</CardTitle>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {nextExam?.schedule.courseCode ?? "Completed"}
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-[0.9rem] border border-border bg-timer px-3 py-2.5 text-center shadow-[0_0_0_1px_rgba(17,17,17,0.02)] sm:px-3.5 dark:shadow-[0_0_0_1px_rgba(139,92,246,0.12),0_12px_30px_rgba(139,92,246,0.16)]">
          {nextExam ? (
            <>
              <motion.p
                key={countdownKey}
                initial={{ opacity: 0.68, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="whitespace-nowrap font-mono text-[clamp(0.82rem,4.3vw,0.98rem)] font-semibold leading-none tracking-[0.05em] text-timer-foreground sm:text-[1.08rem] sm:tracking-[0.08em] lg:text-[1rem] xl:text-[1.08rem] dark:[text-shadow:0_0_18px_rgba(139,92,246,0.16)]"
              >
                {formatted}
              </motion.p>
              <div className="mt-1.5 grid grid-cols-4 gap-1 text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                <span>DAYS</span>
                <span>HRS</span>
                <span>MIN</span>
                <span>SEC</span>
              </div>
            </>
          ) : (
            <motion.p
              key={countdownKey}
              initial={{ opacity: 0.68, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="font-mono text-[0.98rem] font-semibold leading-none tracking-[0.06em] text-timer-foreground sm:text-[1.05rem] dark:[text-shadow:0_0_18px_rgba(139,92,246,0.16)]"
            >
              All exams completed
            </motion.p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
