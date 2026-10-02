import { NextResponse } from "next/server";

import { getAppUrl } from "@/lib/auth/app-url";
import { EVENT_CONFIG } from "@/lib/config/event";
import {
  createKoraMerchantReference,
  getKoraConfigurationStatus,
  getKoraErrorDiagnostic,
  getKoraNotificationUrl,
  initializeKoraCheckout,
  isKoraConfigured
} from "@/lib/payments/kora";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  if (!isSupabaseConfigured() || !isKoraConfigured()) {
    const configuration = getKoraConfigurationStatus();
    console.error("Kora payment configuration is incomplete", {
      publicKeyPresent: configuration.publicKeyPresent,
      secretKeyPresent: configuration.secretKeyPresent,
      environment: configuration.environment,
      environmentValid: configuration.environmentValid,
      appUrlPresent: configuration.appUrlPresent,
      appUrlValid: configuration.appUrlValid,
      webhookRequired: configuration.webhookRequired,
      webhookPolicyValid: configuration.webhookPolicyValid
    });
    return NextResponse.json({ error: "Payments are not configured." }, { status: 503 });
  }

  if (request.headers.get("origin") !== getAppUrl()) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  let body: { name?: unknown; department?: unknown; quantity?: unknown };
  try {
    body = (await request.json()) as { name?: unknown; department?: unknown; quantity?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const department = typeof body.department === "string" ? body.department.trim() : "";
  const rawQuantity = typeof body.quantity === "number" ? body.quantity : Number(body.quantity);
  const quantity = Number.isInteger(rawQuantity) && rawQuantity >= 1 && rawQuantity <= 10 ? rawQuantity : 1;

  if (!name || name.length > 100) {
    return NextResponse.json({ error: "Please enter your name or nickname." }, { status: 422 });
  }

  if (!department || department.length > 100) {
    return NextResponse.json({ error: "Please enter your department." }, { status: 422 });
  }

  const { calculateOrderEconomics } = await import("@/lib/config/event");
  const economics = calculateOrderEconomics(quantity);

  const admin = createAdminClient();
  const merchantReference = createKoraMerchantReference();

  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .insert({
      buyer_name: name,
      buyer_department: department,
      merchant_reference: merchantReference,
      amount_minor: economics.totalMinor,
      organizer_proceeds_minor: economics.organizerProceedsMinor,
      currency: EVENT_CONFIG.currency,
      status: "pending"
    })
    .select("id")
    .single();

  if (paymentError || !payment) {
    console.error("Failed to create ticket payment record", paymentError);
    return NextResponse.json(
      { error: "Ticket payment could not be initiated. Please try again." },
      { status: 500 }
    );
  }

  try {
    const appUrl = getAppUrl();
    const checkout = await initializeKoraCheckout({
      merchantReference,
      amountMinor: economics.totalMinor,
      currency: EVENT_CONFIG.currency,
      customerName: name,
      customerEmail: `${merchantReference.toLowerCase()}@guest.tickets`,
      redirectUrl: `${appUrl}/payment/return`,
      webhookUrl: getKoraNotificationUrl(appUrl),
      narration: `${EVENT_CONFIG.name} (${economics.quantity} Ticket${economics.quantity > 1 ? "s" : ""}) - ${name}`
    });

    await admin
      .from("payments")
      .update({
        checkout_url: checkout.checkoutUrl,
        provider_reference: checkout.providerReference
      })
      .eq("id", payment.id);

    return NextResponse.json({ checkoutUrl: checkout.checkoutUrl });
  } catch (error) {
    console.error("Kora ticket checkout initialization failed", getKoraErrorDiagnostic(error));
    await admin
      .from("payments")
      .update({ status: "failed", failed_at: new Date().toISOString() })
      .eq("id", payment.id);
    return NextResponse.json({ error: "Korapay is temporarily unavailable." }, { status: 502 });
  }
}
