"use client";

import { useState } from "react";
import { ArrowRight, ShieldCheck, Ticket, CreditCard, Loader2, Plus, Minus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { calculateOrderEconomics } from "@/lib/config/event";

export function CheckoutCard() {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const economics = calculateOrderEconomics(quantity);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedDepartment = department.trim();

    if (!trimmedName) {
      setError("Please enter your name or nickname.");
      return;
    }
    if (!trimmedDepartment) {
      setError("Please enter your department.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/kora/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: trimmedName,
          department: trimmedDepartment,
          quantity
        })
      });

      const payload = (await response.json()) as { checkoutUrl?: string; error?: string };

      if (!response.ok || !payload.checkoutUrl) {
        throw new Error(payload.error ?? "Failed to initialize payment. Please try again.");
      }

      const checkout = new URL(payload.checkoutUrl);
      if (checkout.protocol !== "https:") {
        throw new Error("Invalid checkout URL received from payment provider.");
      }

      window.location.assign(checkout.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment initialization failed.");
      setLoading(false);
    }
  }

  return (
    <div
      id="get-ticket"
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/75 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl"
    >
      {/* Subtle top glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 size-48 rounded-full bg-violet-600/15 blur-3xl"
      />

      <div className="relative z-10 space-y-6">
        {/* Ticket Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Party Ticket Checkout
            </span>
            <span className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {economics.totalDisplay}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-zinc-400">
            Official entry pass for Course Representatives&apos; Party Night.
          </p>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Number of Tickets
            </span>
            <p className="text-[11px] text-zinc-400">Max 10 per order</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={quantity <= 1 || loading}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease ticket quantity"
              className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-sm font-bold text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="font-mono text-lg font-extrabold text-white w-6 text-center">
              {quantity}
            </span>
            <button
              type="button"
              disabled={quantity >= 10 || loading}
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              aria-label="Increase ticket quantity"
              className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-sm font-bold text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Transparent Breakdown */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 space-y-2.5 text-xs sm:text-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-2">
              <Ticket className="size-4 text-violet-400 shrink-0" />
              Ticket{quantity > 1 ? ` (×${quantity})` : ""}
            </span>
            <span className="font-medium text-zinc-200">{economics.ticketSubtotalDisplay}</span>
          </div>

          <div className="flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-2">
              <CreditCard className="size-4 text-zinc-400 shrink-0" />
              Payment Processing Fee
            </span>
            <span className="font-medium text-zinc-200">{economics.processingFeeDisplay}</span>
          </div>

          <div className="border-t border-white/10 pt-2.5 flex items-center justify-between font-bold text-sm sm:text-base text-white">
            <span>Total Payment</span>
            <span className="text-violet-400 font-extrabold">{economics.totalDisplay}</span>
          </div>
        </div>

        {/* Simple Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400"
            >
              Name or Nickname
            </label>
            <input
              id="name"
              type="text"
              required
              maxLength={100}
              placeholder="e.g. Alex, DJ Flash"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900/90 px-4 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="department"
              className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400"
            >
              Department
            </label>
            <input
              id="department"
              type="text"
              required
              maxLength={100}
              placeholder="e.g. Computer Science, Psychology"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={loading}
              className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900/90 px-4 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 transition-all"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-400">
              {error}
            </div>
          ) : null}

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="h-13 w-full gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-base font-bold shadow-lg shadow-violet-600/25 transition-all duration-200 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Connecting to Korapay…
                </>
              ) : (
                <>
                  Pay {economics.totalDisplay}
                  <ArrowRight className="size-4.5" />
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-zinc-400">
            <ShieldCheck className="size-3.5 text-violet-400 shrink-0" />
            <span>Secured by Korapay · Bank transfer & card</span>
          </div>
        </form>
      </div>
    </div>
  );
}
