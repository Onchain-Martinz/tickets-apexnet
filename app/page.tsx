import Image from "next/image";
import { Sparkles, Calendar, MapPin, ArrowDown, Ticket } from "lucide-react";

import { CheckoutCard } from "@/components/tickets/checkout-card";
import { PageShell } from "@/components/layout/page-shell";
import { PageReveal } from "@/components/layout/page-reveal";
import { EVENT_CONFIG, CUSTOMER_TOTAL_DISPLAY } from "@/lib/config/event";

export default function HomePage() {
  return (
    <PageShell className="max-w-xl mx-auto px-4 sm:px-6">
      <div className="space-y-8 sm:space-y-10">
        {/* NAV / BRAND */}
        <PageReveal>
          <header className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
                <Ticket className="size-4" />
              </span>
              <span className="font-bold tracking-tight text-white text-sm sm:text-base">
                Course Reps Party
              </span>
            </div>
            <a
              href="#get-ticket"
              className="rounded-full bg-white/10 hover:bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors"
            >
              Get Ticket
            </a>
          </header>
        </PageReveal>

        {/* HERO SECTION WITH BACKGROUND IMAGE */}
        <PageReveal delay={0.03}>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
            {/* Background Image Container */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/party-hero.jpg"
                alt="Course Representatives' Party Night celebration"
                fill
                priority
                className="object-cover object-center scale-[1.02]"
                sizes="(max-width: 640px) 100vw, 576px"
              />
              {/* Dark & Gradient Overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/85 to-zinc-950/60" />
            </div>

            {/* Hero Copy & CTA over image */}
            <div className="relative z-10 text-center space-y-4 px-6 py-10 sm:px-8 sm:py-14">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/40 bg-violet-500/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-violet-300">
                <Sparkles className="size-3.5 text-violet-300" />
                <span>Official Event Portal</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                {EVENT_CONFIG.name}
              </h1>

              <p className="text-sm sm:text-base text-zinc-300 max-w-md mx-auto leading-relaxed">
                {EVENT_CONFIG.tagline}
              </p>

              <div className="pt-2">
                <a
                  href="#get-ticket"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-violet-600 hover:bg-violet-500 px-8 text-base font-bold text-white shadow-xl shadow-violet-600/35 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Get Your Ticket — {CUSTOMER_TOTAL_DISPLAY}</span>
                  <ArrowDown className="size-4" />
                </a>
              </div>
            </div>
          </div>
        </PageReveal>

        {/* SMALL EVENT INFO SECTION */}
        <PageReveal delay={0.06}>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-violet-400 mb-1">
                <Calendar className="size-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Date</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white">TBA</p>
              <p className="text-[11px] text-zinc-400">To be announced</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-violet-400 mb-1">
                <MapPin className="size-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Location</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white">TBA</p>
              <p className="text-[11px] text-zinc-400">To be announced</p>
            </div>
          </div>
        </PageReveal>

        {/* CHECKOUT SECTION */}
        <PageReveal delay={0.09}>
          <CheckoutCard />
        </PageReveal>
      </div>
    </PageShell>
  );
}
