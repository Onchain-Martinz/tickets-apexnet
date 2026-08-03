import { NextResponse } from "next/server";

import {
  createKoraEventKey,
  getKoraReferenceCandidates,
  verifyKoraWebhookSignature
} from "@/lib/payments/kora-signature";
import { verifyAndFinalizePayment } from "@/lib/payments/finalize";
import { createAdminClient } from "@/lib/supabase/admin";

type KoraWebhook = {
  event?: string;
  data?: {
    reference?: string;
    payment_reference?: string;
    status?: string;
  };
};

const MAX_WEBHOOK_BYTES = 128 * 1024;

export async function POST(request: Request) {
  let payload: KoraWebhook;
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_WEBHOOK_BYTES) {
      return NextResponse.json({ received: false }, { status: 413 });
    }
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_WEBHOOK_BYTES) {
      return NextResponse.json({ received: false }, { status: 413 });
    }
    payload = JSON.parse(rawBody) as KoraWebhook;
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  const eventType = String(payload.event ?? "unknown");
  const signatureValid = verifyKoraWebhookSignature(
    payload.data,
    request.headers.get("x-korapay-signature")
  );
  const eventKey = createKoraEventKey(
    `${signatureValid ? "valid" : "invalid"}:${eventType}`,
    payload.data
  );
  const referenceCandidates = getKoraReferenceCandidates(payload.data);
  const providerReference = String(payload.data?.reference ?? "");

  if (!signatureValid) {
    return NextResponse.json({ received: true });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ received: false }, { status: 503 });
  }

  let merchantReference = "";
  try {
    merchantReference = await resolveMerchantReference(admin, referenceCandidates);
  } catch {
    return NextResponse.json({ received: false }, { status: 500 });
  }

  const { data: inserted, error: eventError } = await admin.rpc("record_payment_event", {
    p_event_key: eventKey,
    p_event_type: eventType,
    p_merchant_reference: merchantReference || null,
    p_provider_reference: providerReference || null,
    p_signature_valid: signatureValid,
    p_raw_payload: payload
  });

  if (eventError) return NextResponse.json({ received: false }, { status: 500 });

  if (!inserted) return NextResponse.json({ received: true, duplicate: true });

  try {
    if (eventType === "charge.success" && merchantReference) {
      await verifyAndFinalizePayment(merchantReference);
    } else if (eventType === "charge.failed" && merchantReference) {
      const { error: paymentError } = await admin
        .from("payments")
        .update({ status: "failed", failed_at: new Date().toISOString() })
        .eq("merchant_reference", merchantReference)
        .eq("status", "pending");
      if (paymentError) throw paymentError;
    }
    const { error: finishError } = await admin.rpc("finish_payment_event", {
      p_event_key: eventKey,
      p_processing_error: null
    });
    if (finishError) throw finishError;
    return NextResponse.json({ received: true });
  } catch {
    await admin.rpc("finish_payment_event", {
      p_event_key: eventKey,
      p_processing_error: "verification_or_finalization_failed"
    });
    return NextResponse.json({ received: false }, { status: 500 });
  }
}

async function resolveMerchantReference(
  admin: ReturnType<typeof createAdminClient>,
  candidates: string[]
) {
  if (!candidates.length) return "";

  for (const column of ["merchant_reference", "provider_reference"] as const) {
    const { data: payment, error } = await admin
      .from("payments")
      .select("merchant_reference")
      .in(column, candidates)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (payment?.merchant_reference) return payment.merchant_reference;
  }

  return candidates[0];
}
