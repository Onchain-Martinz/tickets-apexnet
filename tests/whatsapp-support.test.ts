import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const support = readFileSync(
  new URL("../components/support/whatsapp-support-link.tsx", import.meta.url),
  "utf8"
);

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

describe("WhatsApp customer support", () => {
  it("uses the approved Nigerian WhatsApp destination and safe external-link attributes", () => {
    expect(support).toContain(
      "https://wa.me/2349133848512?text=Hi%20Martinz,%20I%20need%20help%20with%20my%20exam%20prep%20account"
    );
    expect(support).toContain('target="_blank"');
    expect(support).toContain('rel="noopener noreferrer"');
  });

  it.each([
    "../components/marketing/soft-paywall.tsx",
    "../app/payment/return/page.tsx",
    "../app/account/page.tsx"
  ])("renders the reusable support link in %s", (path) => {
    expect(source(path)).toContain("<WhatsAppSupportLink");
  });
});
