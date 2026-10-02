import { describe, expect, it, vi, beforeEach } from "vitest";

import { verifyAndFinalizePayment } from "@/lib/payments/finalize";
import { verifiedPaymentMatches } from "@/lib/payments/rules";
import * as koraModule from "@/lib/payments/kora";
import * as supabaseAdminModule from "@/lib/supabase/admin";

describe("Payment Fallback and Race Condition Safety", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function createMockAdmin(paymentState: any, rpcFn?: any) {
    return {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockImplementation(() => Promise.resolve({ data: { ...paymentState }, error: null })),
            maybeSingle: vi.fn().mockImplementation(() => Promise.resolve({ data: { ...paymentState }, error: null }))
          })
        })
      }),
      rpc: rpcFn || vi.fn()
    };
  }

  it("A. Successful webhook: finalizes ticket once when payment is pending", async () => {
    let paymentState = {
      id: "pay-uuid-1",
      merchant_reference: "PARTY-REF-1",
      provider_reference: "KORA-REF-1",
      amount_minor: 750000,
      currency: "NGN",
      status: "pending",
      ticket_number: null as string | null
    };

    const mockAdmin = createMockAdmin(paymentState, vi.fn().mockImplementation((fnName: string, args: { p_payment_id: string; p_provider_reference: string }) => {
      if (fnName === "finalize_verified_payment") {
        paymentState.status = "successful";
        paymentState.ticket_number = "TKT-PAYUUID1";
        paymentState.provider_reference = args.p_provider_reference;
        return Promise.resolve({ data: { ...paymentState }, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    }));

    vi.spyOn(supabaseAdminModule, "createAdminClient").mockReturnValue(mockAdmin as any);
    vi.spyOn(koraModule, "verifyKoraCharge").mockResolvedValue({
      merchantReference: "PARTY-REF-1",
      providerReference: "KORA-REF-1",
      amountMinor: 750000,
      currency: "NGN",
      successful: true,
      raw: { status: true, data: { status: "success" } }
    });

    const result = await verifyAndFinalizePayment("PARTY-REF-1");

    expect(result.status).toBe("successful");
    expect(result.ticket_number).toBe("TKT-PAYUUID1");
    expect(mockAdmin.rpc).toHaveBeenCalledTimes(1);
    expect(mockAdmin.rpc).toHaveBeenCalledWith("finalize_verified_payment", expect.objectContaining({
      p_payment_id: "pay-uuid-1",
      p_provider_reference: "KORA-REF-1"
    }));
  });

  it("B. Successful return-page verification: queries Korapay and finalizes ticket when webhook is missing", async () => {
    let paymentState = {
      id: "pay-uuid-2",
      merchant_reference: "PARTY-REF-2",
      provider_reference: null as string | null,
      amount_minor: 750000,
      currency: "NGN",
      status: "pending",
      ticket_number: null as string | null
    };

    const mockAdmin = createMockAdmin(paymentState, vi.fn().mockImplementation((fnName: string, args: { p_payment_id: string; p_provider_reference: string }) => {
      if (fnName === "finalize_verified_payment") {
        paymentState.status = "successful";
        paymentState.ticket_number = "TKT-PAYUUID2";
        paymentState.provider_reference = args.p_provider_reference;
        return Promise.resolve({ data: { ...paymentState }, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    }));

    vi.spyOn(supabaseAdminModule, "createAdminClient").mockReturnValue(mockAdmin as any);
    vi.spyOn(koraModule, "verifyKoraCharge").mockResolvedValue({
      merchantReference: "PARTY-REF-2",
      providerReference: "KORA-REF-2",
      amountMinor: 750000,
      currency: "NGN",
      successful: true,
      raw: { status: true, data: { status: "success" } }
    });

    const result = await verifyAndFinalizePayment("PARTY-REF-2");

    expect(result.status).toBe("successful");
    expect(result.ticket_number).toBe("TKT-PAYUUID2");
    expect(mockAdmin.rpc).toHaveBeenCalledTimes(1);
  });

  it("C. Webhook + return-page concurrent execution: exactly one ticket and idempotent result", async () => {
    let paymentState = {
      id: "pay-uuid-3",
      merchant_reference: "PARTY-REF-3",
      provider_reference: null as string | null,
      amount_minor: 750000,
      currency: "NGN",
      status: "pending",
      ticket_number: null as string | null
    };

    const mockAdmin = createMockAdmin(paymentState, vi.fn().mockImplementation((fnName: string, args: { p_payment_id: string; p_provider_reference: string }) => {
      if (fnName === "finalize_verified_payment") {
        paymentState.status = "successful";
        if (!paymentState.ticket_number) {
          paymentState.ticket_number = "TKT-PAYUUID3";
        }
        paymentState.provider_reference = args.p_provider_reference;
        return Promise.resolve({ data: { ...paymentState }, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    }));

    vi.spyOn(supabaseAdminModule, "createAdminClient").mockReturnValue(mockAdmin as any);
    vi.spyOn(koraModule, "verifyKoraCharge").mockResolvedValue({
      merchantReference: "PARTY-REF-3",
      providerReference: "KORA-REF-3",
      amountMinor: 750000,
      currency: "NGN",
      successful: true,
      raw: { status: true, data: { status: "success" } }
    });

    const [resultA, resultB] = await Promise.all([
      verifyAndFinalizePayment("PARTY-REF-3"),
      verifyAndFinalizePayment("PARTY-REF-3")
    ]);

    expect(resultA.status).toBe("successful");
    expect(resultB.status).toBe("successful");
    expect(resultA.ticket_number).toBe("TKT-PAYUUID3");
    expect(resultB.ticket_number).toBe("TKT-PAYUUID3");
    expect(resultA.ticket_number).toBe(resultB.ticket_number);

    // Subsequent idempotent call
    const subsequentCall = await verifyAndFinalizePayment("PARTY-REF-3");
    expect(subsequentCall.status).toBe("successful");
    expect(subsequentCall.ticket_number).toBe("TKT-PAYUUID3");
  });

  it("D. Korapay says payment is still pending: ticket remains pending without finalization", async () => {
    let paymentState = {
      id: "pay-uuid-4",
      merchant_reference: "PARTY-REF-4",
      provider_reference: null as string | null,
      amount_minor: 750000,
      currency: "NGN",
      status: "pending",
      ticket_number: null as string | null
    };

    const mockAdmin = createMockAdmin(paymentState);

    vi.spyOn(supabaseAdminModule, "createAdminClient").mockReturnValue(mockAdmin as any);
    vi.spyOn(koraModule, "verifyKoraCharge").mockResolvedValue({
      merchantReference: "PARTY-REF-4",
      providerReference: "KORA-REF-4",
      amountMinor: 750000,
      currency: "NGN",
      successful: false,
      raw: { status: true, data: { status: "pending" } }
    });

    await expect(verifyAndFinalizePayment("PARTY-REF-4")).rejects.toThrow(
      "Kora verification did not match the expected payment."
    );

    expect(mockAdmin.rpc).not.toHaveBeenCalled();
    expect(paymentState.status).toBe("pending");
    expect(paymentState.ticket_number).toBeNull();
  });

  it("E. Korapay verification fails (wrong amount or currency): does not issue ticket", async () => {
    let paymentState = {
      id: "pay-uuid-5",
      merchant_reference: "PARTY-REF-5",
      provider_reference: null as string | null,
      amount_minor: 750000,
      currency: "NGN",
      status: "pending",
      ticket_number: null as string | null
    };

    const mockAdmin = createMockAdmin(paymentState);

    vi.spyOn(supabaseAdminModule, "createAdminClient").mockReturnValue(mockAdmin as any);

    vi.spyOn(koraModule, "verifyKoraCharge").mockResolvedValue({
      merchantReference: "PARTY-REF-5",
      providerReference: "KORA-REF-5",
      amountMinor: 10000,
      currency: "NGN",
      successful: true,
      raw: { status: true, data: { status: "success", amount: 100 } }
    });

    await expect(verifyAndFinalizePayment("PARTY-REF-5")).rejects.toThrow(
      "Kora verification did not match the expected payment."
    );

    expect(mockAdmin.rpc).not.toHaveBeenCalled();
    expect(paymentState.ticket_number).toBeNull();
  });
});
