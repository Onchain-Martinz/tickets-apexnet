import "server-only";

import { randomUUID } from "node:crypto";

type KoraChargeData = {
  reference?: string;
  payment_reference?: string;
  merchant_reference?: string;
  checkout_url?: string;
  amount?: number | string;
  amount_paid?: number | string;
  currency?: string;
  status?: string;
  transaction_status?: string;
};

type KoraResponse = {
  status: boolean | string;
  error?: string;
  message?: string;
  data?: KoraChargeData;
};

export type KoraConfigurationStatus = {
  publicKeyPresent: boolean;
  secretKeyPresent: boolean;
  environment: string | null;
  environmentValid: boolean;
  appUrlPresent: boolean;
  appUrlValid: boolean;
  webhookRequired: boolean;
  webhookPolicyValid: boolean;
  configured: boolean;
};

export type KoraErrorDiagnostic = {
  httpStatus: number | null;
  errorCode: string | null;
  message: string;
  invalidFields: string[];
};

export type VerifiedKoraCharge = {
  merchantReference: string;
  providerReference: string;
  amountMinor: number;
  currency: string;
  successful: boolean;
  raw: KoraResponse;
};

const KORA_API_URL = "https://api.korapay.com/merchant/api/v1";

class KoraApiError extends Error {
  constructor(
    message: string,
    readonly httpStatus: number,
    readonly errorCode: string | null,
    readonly invalidFields: string[]
  ) {
    super(message);
    this.name = "KoraApiError";
  }
}

function getSecretKey() {
  const value = process.env.KORA_SECRET_KEY;
  if (!value) throw new Error("Kora secret key is missing.");
  return value;
}

export function getKoraConfigurationStatus(
  environment: Record<string, string | undefined> = process.env
): KoraConfigurationStatus {
  const mode = environment.KORA_ENVIRONMENT?.trim().toLowerCase() ?? null;
  const appUrl = environment.NEXT_PUBLIC_APP_URL;
  const production = environment.NODE_ENV === "production";
  const webhookRequired = environment.KORA_WEBHOOK_REQUIRED?.trim().toLowerCase() !== "false";
  let appUrlValid = false;

  if (appUrl) {
    try {
      const parsed = new URL(appUrl);
      appUrlValid = production
        ? parsed.protocol === "https:" && !isLoopbackHost(parsed.hostname)
        : parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      appUrlValid = false;
    }
  }

  const secretKeyPresent = Boolean(environment.KORA_SECRET_KEY);
  const environmentValid = production
    ? mode === "live"
    : mode === "test" || mode === "live";
  const webhookPolicyValid = !production || webhookRequired;

  return {
    publicKeyPresent: Boolean(environment.KORA_PUBLIC_KEY),
    secretKeyPresent,
    environment: mode,
    environmentValid,
    appUrlPresent: Boolean(appUrl),
    appUrlValid,
    webhookRequired,
    webhookPolicyValid,
    configured: secretKeyPresent && environmentValid && appUrlValid && webhookPolicyValid
  };
}

export function isKoraConfigured() {
  return getKoraConfigurationStatus().configured;
}

export function getKoraNotificationUrl(appUrl: string) {
  const url = new URL(appUrl);
  if (url.protocol !== "https:") return undefined;
  return new URL("/api/payments/kora/webhook", url).toString();
}

export function createKoraMerchantReference(
  timestamp = Date.now(),
  entropy = randomUUID()
) {
  const compactEntropy = entropy.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);
  if (!compactEntropy) throw new Error("Kora reference entropy is missing.");
  return `IMSU-${timestamp}-${compactEntropy}`;
}

export function getKoraErrorDiagnostic(error: unknown): KoraErrorDiagnostic {
  if (error instanceof KoraApiError) {
    return {
      httpStatus: error.httpStatus,
      errorCode: error.errorCode,
      message: error.message,
      invalidFields: error.invalidFields
    };
  }

  return {
    httpStatus: null,
    errorCode: null,
    message: error instanceof Error ? error.message : "Unknown Kora initialization error.",
    invalidFields: []
  };
}

export function minorToKoraAmount(amountMinor: number) {
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0 || amountMinor % 100 !== 0) {
    throw new Error("Kora amount must be a positive whole NGN amount.");
  }
  return amountMinor / 100;
}

export async function initializeKoraCheckout(input: {
  merchantReference: string;
  amountMinor: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  redirectUrl: string;
  webhookUrl?: string;
}) {
  const response = await fetch(`${KORA_API_URL}/charges/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: minorToKoraAmount(input.amountMinor),
      currency: input.currency,
      reference: input.merchantReference,
      narration: "IMSU Exam Prep Premium Platform Access",
      redirect_url: input.redirectUrl,
      ...(input.webhookUrl ? { notification_url: input.webhookUrl } : {}),
      customer: {
        name: input.customerName,
        email: input.customerEmail
      },
      metadata: {
        product: "premium-access"
      }
    }),
    cache: "no-store"
  });

  const payload = await readKoraResponse(response);
  if (!response.ok || !isSuccessfulApiResponse(payload) || !payload.data?.checkout_url) {
    throw new KoraApiError(
      payload.message ?? "Kora checkout initialization failed.",
      response.status,
      payload.error ?? null,
      payload.data && typeof payload.data === "object" ? Object.keys(payload.data) : []
    );
  }

  return {
    checkoutUrl: payload.data.checkout_url,
    providerReference: payload.data.reference ?? null,
    raw: payload
  };
}

function isLoopbackHost(hostname: string) {
  return ["localhost", "127.0.0.1", "[::1]", "::1"].includes(hostname);
}

export async function verifyKoraCharge(merchantReference: string): Promise<VerifiedKoraCharge> {
  const response = await fetch(
    `${KORA_API_URL}/charges/${encodeURIComponent(merchantReference)}`,
    {
      headers: { Authorization: `Bearer ${getSecretKey()}` },
      cache: "no-store"
    }
  );
  const payload = await readKoraResponse(response);
  if (!response.ok || !isSuccessfulApiResponse(payload) || !payload.data) {
    throw new Error("Kora charge verification failed.");
  }

  const data = payload.data;
  const amount = Number(data.amount_paid ?? data.amount);
  if (!Number.isFinite(amount)) throw new Error("Kora returned an invalid amount.");

  const returnedMerchantReference = data.merchant_reference ?? merchantReference;

  return {
    merchantReference: returnedMerchantReference,
    providerReference: data.reference ?? merchantReference,
    amountMinor: Math.round(amount * 100),
    currency: String(data.currency ?? "").toUpperCase(),
    successful:
      String(data.status ?? "").toLowerCase() === "success" &&
      (!data.transaction_status || data.transaction_status.toLowerCase() === "success"),
    raw: payload
  };
}

function isSuccessfulApiResponse(payload: KoraResponse) {
  return payload.status === true || payload.status === "true";
}

async function readKoraResponse(response: Response): Promise<KoraResponse> {
  try {
    return await response.json() as KoraResponse;
  } catch {
    return { status: false, message: "Kora returned an unreadable response." };
  }
}
