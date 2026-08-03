"use client";

import { useState } from "react";

import { SoftPaywall } from "@/components/marketing/soft-paywall";
import { getFirstName } from "@/lib/content/funnel-copy";
import type { CourseScheduleDTO } from "@/lib/domain/exams";

type PremiumPaywallProps = {
  schedule: CourseScheduleDTO;
  plan: { amountMinor: number; currency: string } | null;
  userName: string;
};

export function PremiumPaywall({ schedule, plan, userName }: PremiumPaywallProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const price = plan
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: plan.currency,
        maximumFractionDigits: 0
      }).format(plan.amountMinor / 100)
    : null;

  async function beginCheckout() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/payments/kora/initialize", { method: "POST" });
      const payload = (await response.json()) as { checkoutUrl?: string; error?: string };
      if (!response.ok || !payload.checkoutUrl) throw new Error(payload.error ?? "Checkout failed.");
      const checkout = new URL(payload.checkoutUrl);
      if (checkout.protocol !== "https:") throw new Error("Invalid checkout URL.");
      window.location.assign(checkout.toString());
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout failed.");
      setLoading(false);
    }
  }

  return (
    <SoftPaywall
      schedule={schedule}
      name={getFirstName(userName)}
      price={price}
      loading={loading}
      error={error}
      onCheckout={beginCheckout}
    />
  );
}
