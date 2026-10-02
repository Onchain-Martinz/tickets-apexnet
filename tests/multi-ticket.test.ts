import { describe, expect, it } from "vitest";
import { calculateOrderEconomics, EVENT_CONFIG } from "../lib/config/event";
import { readFileSync } from "node:fs";

const ticketPassCardSource = readFileSync(
  new URL("../components/tickets/ticket-pass-card.tsx", import.meta.url),
  "utf8"
);
const checkoutCardSource = readFileSync(
  new URL("../components/tickets/checkout-card.tsx", import.meta.url),
  "utf8"
);
const initializeRouteSource = readFileSync(
  new URL("../app/api/payments/kora/initialize/route.ts", import.meta.url),
  "utf8"
);

describe("Multiple Tickets & Order Economics", () => {
  it("calculates correct economics for single ticket", () => {
    const eco = calculateOrderEconomics(1);
    expect(eco.quantity).toBe(1);
    expect(eco.ticketSubtotalMinor).toBe(15000);
    expect(eco.processingFeeMinor).toBe(5000);
    expect(eco.totalMinor).toBe(20000);
    expect(eco.organizerProceedsMinor).toBe(14700);
    expect(eco.totalDisplay).toBe("₦200");
  });

  it("calculates correct economics for multiple tickets", () => {
    const eco2 = calculateOrderEconomics(2);
    expect(eco2.quantity).toBe(2);
    expect(eco2.ticketSubtotalMinor).toBe(30000);
    expect(eco2.processingFeeMinor).toBe(10000);
    expect(eco2.totalMinor).toBe(40000);
    expect(eco2.organizerProceedsMinor).toBe(29400);
    expect(eco2.totalDisplay).toBe("₦400");

    const eco5 = calculateOrderEconomics(5);
    expect(eco5.quantity).toBe(5);
    expect(eco5.ticketSubtotalMinor).toBe(75000);
    expect(eco5.processingFeeMinor).toBe(25000);
    expect(eco5.totalMinor).toBe(100000);
    expect(eco5.organizerProceedsMinor).toBe(73500);
    expect(eco5.totalDisplay).toBe("₦1,000");
  });

  it("enforces boundary limits on quantity (1 to 10)", () => {
    expect(calculateOrderEconomics(0).quantity).toBe(1);
    expect(calculateOrderEconomics(-5).quantity).toBe(1);
    expect(calculateOrderEconomics(15).quantity).toBe(10);
    expect(calculateOrderEconomics(10).quantity).toBe(10);
  });

  it("includes Back to Homepage link on TicketPassCard", () => {
    expect(ticketPassCardSource).toContain("Back to Homepage");
    expect(ticketPassCardSource).toContain('href="/"');
  });

  it("includes quantity selector in CheckoutCard", () => {
    expect(checkoutCardSource).toContain("Number of Tickets");
    expect(checkoutCardSource).toContain("setQuantity");
    expect(checkoutCardSource).toContain("calculateOrderEconomics");
  });

  it("server-side calculates payment amount in initialization route", () => {
    expect(initializeRouteSource).toContain("calculateOrderEconomics");
    expect(initializeRouteSource).toContain("amount_minor: economics.totalMinor");
    expect(initializeRouteSource).toContain("amountMinor: economics.totalMinor");
  });

  it("generates deterministic and unique ticket numbers for multi-ticket orders", async () => {
    const { LocalSupabaseAdminClient } = await import("../lib/supabase/local-store");
    const client = new LocalSupabaseAdminClient();
    const insertRes = await client.from("payments").insert({
      buyer_name: "Martinz Multi",
      buyer_department: "Psychology",
      merchant_reference: "PARTY-TEST-MULTI-3",
      amount_minor: 60000,
      currency: "NGN",
      status: "pending"
    }).single();

    const paymentId = insertRes.data.id;
    const fin1 = await client.rpc("finalize_verified_payment", {
      p_payment_id: paymentId,
      p_provider_reference: "PROV-MULTI-3",
      p_verification_payload: { status: "success" }
    });

    expect(fin1.data.status).toBe("successful");
    const ticketNums = fin1.data.ticket_number.split(",").map((s: string) => s.trim());
    expect(ticketNums.length).toBe(3);
    expect(ticketNums[0]).toContain("-1");
    expect(ticketNums[1]).toContain("-2");
    expect(ticketNums[2]).toContain("-3");

    // Idempotent retry returns identical tickets
    const fin2 = await client.rpc("finalize_verified_payment", {
      p_payment_id: paymentId,
      p_provider_reference: "PROV-MULTI-3",
      p_verification_payload: { status: "success" }
    });
    expect(fin2.data.ticket_number).toBe(fin1.data.ticket_number);
  });
});
