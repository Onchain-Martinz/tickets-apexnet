import "server-only";

import { verifyKoraCharge } from "@/lib/payments/kora";
import { verifiedPaymentMatches } from "@/lib/payments/rules";
import { createAdminClient } from "@/lib/supabase/admin";

export async function verifyAndFinalizePayment(referenceInput: string) {
  const admin = createAdminClient();
  const cleanRef = referenceInput.trim();
  if (!cleanRef) throw new Error("Payment reference is required.");

  let { data: payment, error } = await admin
    .from("payments")
    .select("id, user_id, merchant_reference, provider_reference, buyer_name, buyer_department, ticket_number, amount_minor, currency, status, verified_at")
    .eq("merchant_reference", cleanRef)
    .maybeSingle();

  if (!payment) {
    const { data: byProvider } = await admin
      .from("payments")
      .select("id, user_id, merchant_reference, provider_reference, buyer_name, buyer_department, ticket_number, amount_minor, currency, status, verified_at")
      .eq("provider_reference", cleanRef)
      .maybeSingle();
    payment = byProvider;
  }

  if (error || !payment) throw new Error("Payment was not found.");
  if (payment.status === "successful") return payment;
  if (payment.status !== "pending") throw new Error("Payment is not pending.");

  const verified = await verifyKoraCharge(payment.merchant_reference);
  if (
    !verifiedPaymentMatches(
      {
        merchantReference: payment.merchant_reference,
        amountMinor: Number(payment.amount_minor),
        currency: payment.currency
      },
      verified
    )
  ) {
    throw new Error("Kora verification did not match the expected payment.");
  }

  const { data: finalized, error: finalizeError } = await admin.rpc(
    "finalize_verified_payment",
    {
      p_payment_id: payment.id,
      p_provider_reference: verified.providerReference,
      p_verification_payload: verified.raw
    }
  );
  if (finalizeError) throw new Error("Payment finalization failed.");
  return finalized;
}
