import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export function verifyKoraWebhookSignature(
  data: unknown,
  providedSignature: string | null,
  secretKey = process.env.KORA_SECRET_KEY
) {
  if (!providedSignature || !secretKey) return false;
  const expected = createHmac("sha256", secretKey)
    .update(JSON.stringify(data))
    .digest("hex");
  const provided = providedSignature.trim().toLowerCase();
  if (!/^[a-f0-9]+$/.test(provided) || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided, "hex"), Buffer.from(expected, "hex"));
}

export function createKoraEventKey(eventType: string, data: unknown) {
  return createHash("sha256")
    .update(`${eventType}:${JSON.stringify(data)}`)
    .digest("hex");
}

export function getKoraReferenceCandidates(data: {
  reference?: unknown;
  payment_reference?: unknown;
} | null | undefined) {
  return [...new Set([data?.payment_reference, data?.reference]
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean))];
}
