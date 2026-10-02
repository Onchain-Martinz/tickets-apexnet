"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  verifyAdminPassword,
  setAdminSessionCookie,
  clearAdminSessionCookie,
  requireAdminAuth
} from "@/lib/auth/admin-auth";
import { verifyAndFinalizePayment } from "@/lib/payments/finalize";

function required(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) throw new Error(`${key} is required.`);
  return value;
}

export async function loginAdminAction(formData: FormData) {
  const password = String(formData.get("password") ?? "").trim();
  const nextPath = String(formData.get("next") ?? "/admin").trim();

  if (!password || !verifyAdminPassword(password)) {
    const errorParam = encodeURIComponent("Incorrect password. Please try again.");
    redirect(`/admin/login?error=${errorParam}&next=${encodeURIComponent(nextPath)}`);
  }

  await setAdminSessionCookie();
  redirect(nextPath.startsWith("/admin") ? nextPath : "/admin");
}

export async function logoutAdminAction() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}

export async function reconcilePaymentAction(formData: FormData) {
  await requireAdminAuth();
  const merchantReference = required(formData, "merchant_reference");
  try {
    await verifyAndFinalizePayment(merchantReference);
    revalidatePath("/admin");
  } catch (error) {
    console.error("Reconciliation failed for " + merchantReference, error);
    redirect("/admin?error=reconciliation_failed");
  }
}
