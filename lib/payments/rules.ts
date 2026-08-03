export type ExpectedPayment = {
  merchantReference: string;
  amountMinor: number;
  currency: string;
};

export type VerifiedPayment = ExpectedPayment & {
  successful: boolean;
};

export function verifiedPaymentMatches(
  expected: ExpectedPayment,
  verified: VerifiedPayment
) {
  return (
    verified.successful &&
    verified.merchantReference === expected.merchantReference &&
    verified.amountMinor === expected.amountMinor &&
    verified.currency === expected.currency
  );
}

export function calculateCommission(amountMinor: number, commissionBps: number) {
  if (!Number.isSafeInteger(amountMinor) || amountMinor < 0) {
    throw new Error("Invalid sale amount.");
  }
  if (!Number.isInteger(commissionBps) || commissionBps < 0 || commissionBps > 10000) {
    throw new Error("Invalid commission rate.");
  }
  return Math.floor((amountMinor * commissionBps) / 10000);
}
