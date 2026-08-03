"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function PaymentRetryButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function retry() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/payments/kora/initialize", { method: "POST" });
      const payload = (await response.json()) as { checkoutUrl?: string; error?: string };
      if (!response.ok || !payload.checkoutUrl) throw new Error(payload.error ?? "Retry failed.");
      const checkout = new URL(payload.checkoutUrl);
      if (checkout.protocol !== "https:") throw new Error("Invalid checkout URL.");
      window.location.assign(checkout.toString());
    } catch (retryError) {
      setError(retryError instanceof Error ? retryError.message : "Retry failed.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="secondary" disabled={loading} onClick={retry}>
        {loading ? "Opening checkout…" : "Try payment again"}
      </Button>
      {error ? <p className="text-xs text-muted-foreground">{error}</p> : null}
    </div>
  );
}
