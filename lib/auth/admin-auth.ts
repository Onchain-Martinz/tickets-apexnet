import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_ADMIN_PASSWORD = "Loveisscam123@";
const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}

function getSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    getAdminPassword()
  );
}

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

export function verifyAdminPassword(password: string): boolean {
  const expected = Buffer.from(getAdminPassword());
  const actual = Buffer.from(password);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export async function createAdminSessionToken(): Promise<string> {
  const issuedAt = Date.now();
  const payload = `${issuedAt}:admin`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  const [issuedAtStr, role] = payload.split(":");
  if (role !== "admin") return false;

  const issuedAt = Number(issuedAtStr);
  if (isNaN(issuedAt)) return false;

  // Expire after 7 days
  if (Date.now() - issuedAt > SESSION_MAX_AGE_SECONDS * 1000) return false;

  const expectedSignature = sign(payload);
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(sigBuffer, expectedBuffer);
}

export async function setAdminSessionCookie(): Promise<void> {
  const token = await createAdminSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export async function requireAdminAuth(nextPath = "/admin"): Promise<void> {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
  }
}
