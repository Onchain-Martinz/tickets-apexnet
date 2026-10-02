import { describe, expect, it } from "vitest";
import {
  verifyAdminPassword,
  createAdminSessionToken,
  verifyAdminSessionToken
} from "../lib/auth/admin-auth";

describe("Admin Password Authentication & Session Gate", () => {
  it("verifies correct admin password", () => {
    expect(verifyAdminPassword("Loveisscam123@")).toBe(true);
  });

  it("rejects incorrect admin password", () => {
    expect(verifyAdminPassword("wrong-password")).toBe(false);
    expect(verifyAdminPassword("")).toBe(false);
    expect(verifyAdminPassword("loveisscam123@")).toBe(false);
  });

  it("creates and verifies valid admin session tokens", async () => {
    const token = await createAdminSessionToken();
    expect(typeof token).toBe("string");
    expect(token).toContain(":admin.");
    expect(verifyAdminSessionToken(token)).toBe(true);
  });

  it("rejects forged or tampered session tokens", async () => {
    const validToken = await createAdminSessionToken();
    const [payload, sig] = validToken.split(".");
    
    // Tampered payload
    expect(verifyAdminSessionToken(`9999999999999:admin.${sig}`)).toBe(false);
    // Tampered signature
    expect(verifyAdminSessionToken(`${payload}.invalidsig1234567890abcdef`)).toBe(false);
    // Malformed tokens
    expect(verifyAdminSessionToken("")).toBe(false);
    expect(verifyAdminSessionToken("not-a-token")).toBe(false);
    expect(verifyAdminSessionToken(null as any)).toBe(false);
  });

  it("rejects expired session tokens", () => {
    // 8 days ago
    const oldTimestamp = Date.now() - 8 * 24 * 60 * 60 * 1000;
    const oldPayload = `${oldTimestamp}:admin`;
    // Even if signature is signed with same key, timestamp check rejects it
    const { createHmac } = require("node:crypto");
    const secret = process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "Loveisscam123@";
    const sig = createHmac("sha256", secret).update(oldPayload).digest("hex");
    const expiredToken = `${oldPayload}.${sig}`;

    expect(verifyAdminSessionToken(expiredToken)).toBe(false);
  });
});
