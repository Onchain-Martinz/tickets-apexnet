"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PaymentStatusRefresh({ active }: { active: boolean }) {
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 6; // 18 seconds of auto-polling

  useEffect(() => {
    if (!active) return;
    if (retryCount >= maxRetries) return;

    const timer = window.setTimeout(() => {
      setRetryCount((prev) => prev + 1);
      router.refresh();
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [active, retryCount, router]);

  if (!active) return null;

  if (retryCount >= maxRetries) {
    return (
      <div className="mt-4 pt-2 text-center">
        <Button
          onClick={() => {
            setRetryCount(0);
            router.refresh();
          }}
          variant="ghost"
          size="sm"
          className="gap-2 border-white/10 bg-white/5 text-xs text-zinc-300 hover:text-white"
        >
          <RefreshCw className="size-3.5" />
          Check Status Again
        </Button>
      </div>
    );
  }

  return null;
}
