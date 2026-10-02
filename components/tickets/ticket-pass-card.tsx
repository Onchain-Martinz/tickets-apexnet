"use client";

import Link from "next/link";
import { CheckCircle2, Calendar, MapPin, Download, PartyPopper, ArrowLeft, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EVENT_CONFIG } from "@/lib/config/event";

type TicketPassCardProps = {
  buyerName: string;
  department: string;
  ticketNumber: string;
  verifiedAt: string | null;
  merchantReference: string;
  amountMinor?: number;
};

export function TicketPassCard({
  buyerName,
  department,
  ticketNumber,
  verifiedAt,
  merchantReference,
  amountMinor
}: TicketPassCardProps) {
  function handlePrint() {
    window.print();
  }

  const formattedDate = verifiedAt
    ? new Date(verifiedAt).toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short"
      })
    : "Verified";

  const ticketList = ticketNumber
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const displayAmount = amountMinor
    ? `₦${(amountMinor / 100).toLocaleString("en-NG")}`
    : `₦${((ticketList.length || 1) * 200).toLocaleString("en-NG")}`;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex size-14 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
          <PartyPopper className="size-7" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Payment Successful!
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Your entry pass is confirmed. Save or screenshot this ticket.
        </p>
      </div>

      {/* Ticket Pass Container */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/85 shadow-2xl backdrop-blur-2xl">
        {/* Pass Header */}
        <div className="border-b border-dashed border-white/10 bg-violet-600/10 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-violet-300">
                Official Entry Pass
              </span>
              <h2 className="mt-2 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                {EVENT_CONFIG.name}
              </h2>
              <p className="text-xs text-zinc-400">{EVENT_CONFIG.tagline}</p>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-center shrink-0">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                <span>PAID</span>
              </div>
              <div className="text-sm font-extrabold text-white">{displayAmount}</div>
            </div>
          </div>
        </div>

        {/* Pass Details */}
        <div className="space-y-5 p-5 sm:p-6">
          {/* Ticket Number Highlight */}
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 text-center space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
              {ticketList.length > 1 ? `Ticket Numbers (${ticketList.length} Tickets)` : "Ticket Number"}
            </p>
            {ticketList.length > 1 ? (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {ticketList.map((tkt, idx) => (
                  <span
                    key={tkt}
                    className="inline-flex items-center gap-1 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1 font-mono text-xs sm:text-sm font-extrabold tracking-wider text-violet-300"
                  >
                    <Ticket className="size-3 text-violet-400" />
                    #{idx + 1}: {tkt}
                  </span>
                ))}
              </div>
            ) : (
              <p className="font-mono text-xl font-extrabold tracking-widest text-violet-400 sm:text-2xl">
                {ticketList[0] || ticketNumber}
              </p>
            )}
          </div>

          {/* Attendee Info Grid */}
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs sm:text-sm">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Attendee
              </p>
              <p className="mt-0.5 font-bold text-white">
                {buyerName}
                {ticketList.length > 1 ? ` (${ticketList.length} Tickets)` : ""}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Department
              </p>
              <p className="mt-0.5 font-bold text-white">{department}</p>
            </div>
          </div>

          {/* Event Schedule Info */}
          <div className="space-y-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-violet-400 shrink-0" />
              <span className="font-medium text-zinc-200">{EVENT_CONFIG.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-violet-400 shrink-0" />
              <span className="font-medium text-zinc-200">{EVENT_CONFIG.venue}</span>
            </div>
          </div>

          {/* Verification Timestamp */}
          <div className="border-t border-dashed border-white/10 pt-4 text-[11px] text-zinc-400 flex justify-between items-center">
            <span>Ref: {merchantReference}</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5">
        <Button
          onClick={handlePrint}
          className="h-12 w-full gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-lg shadow-violet-600/25 transition-all"
        >
          <Download className="size-4" />
          Save / Print Ticket
        </Button>
        <Button
          asChild
          variant="ghost"
          className="h-11 w-full gap-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Link href="/">
            <ArrowLeft className="size-3.5" />
            Back to Homepage
          </Link>
        </Button>
      </div>
    </div>
  );
}
