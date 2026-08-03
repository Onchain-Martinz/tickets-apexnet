import { NextResponse } from "next/server";

import { getAppUrl } from "@/lib/auth/app-url";
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
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, full_name, email, cohort_id, account_status, onboarding_completed_at")
    .eq("id", userData.user.id)
    .single();

  if (!profile || profile.account_status !== "active" || !profile.onboarding_completed_at || !profile.cohort_id) {
    return NextResponse.json({ error: "Complete onboarding before purchasing." }, { status: 403 });
  }

  const { data: existingEntitlement } = await admin
    .from("premium_entitlements")
    .select("id")
    .eq("user_id", profile.id)
    .is("revoked_at", null)
    .limit(1)
    .maybeSingle();
  if (existingEntitlement) {
    return NextResponse.json({ error: "Premium access is already active." }, { status: 409 });
  }

  const { data: plan } = await admin
    .from("premium_plans")
    .select("id, amount_minor, currency")
    .eq("cohort_id", profile.cohort_id)
    .eq("status", "active")
    .single();
  if (!plan) return NextResponse.json({ error: "No active premium plan." }, { status: 409 });

  const { data: existingPayment } = await admin
    .from("payments")
    .select("id, checkout_url, initiated_at, amount_minor, currency")
    .eq("user_id", profile.id)
    .eq("premium_plan_id", plan.id)
    .eq("status", "pending")
    .not("checkout_url", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const pendingMatchesPlan = Boolean(
    existingPayment &&
      Number(existingPayment.amount_minor) === Number(plan.amount_minor) &&
      existingPayment.currency === plan.currency
  );
  const pendingIsFresh = existingPayment
    ? pendingMatchesPlan &&
      Date.now() - new Date(existingPayment.initiated_at).getTime() < 30 * 60 * 1000
    : false;
  if (existingPayment?.checkout_url && pendingIsFresh) {
    return NextResponse.json({ checkoutUrl: existingPayment.checkout_url });
  }
  if (existingPayment && !pendingIsFresh) {
    await admin
      .from("payments")
      .update({ status: "failed", failed_at: new Date().toISOString() })
      .eq("id", existingPayment.id)
      .eq("status", "pending");
  }

  const merchantReference = createKoraMerchantReference();
  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .insert({
      user_id: profile.id,
      premium_plan_id: plan.id,
      merchant_reference: merchantReference,
      amount_minor: plan.amount_minor,
      currency: plan.currency
    })
    .select("id")
    .single();
  if (paymentError || !payment) {
    return NextResponse.json(
      { error: paymentError?.code === "23505" ? "A checkout is already being prepared." : "Payment could not be created." },
      { status: paymentError?.code === "23505" ? 409 : 500 }
    );
  }

  try {
    const appUrl = getAppUrl();
    const checkout = await initializeKoraCheckout({
      merchantReference,
      amountMinor: Number(plan.amount_minor),
      currency: plan.currency,
      customerName: profile.full_name,
      customerEmail: profile.email,
      redirectUrl: `${appUrl}/payment/return`,
      webhookUrl: getKoraNotificationUrl(appUrl)
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
    console.error("Kora checkout initialization failed", getKoraErrorDiagnostic(error));
    await admin
      .from("payments")
      .update({ status: "failed", failed_at: new Date().toISOString() })
      .eq("id", payment.id);
    return NextResponse.json({ error: "Kora is temporarily unavailable." }, { status: 502 });
  }
}
