import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const footerSource = readFileSync(
  new URL("../components/layout/site-footer.tsx", import.meta.url),
  "utf8"
);

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

describe("Customer support and branding cleanup", () => {
  it.each([
    "../app/page.tsx",
    "../app/payment/return/page.tsx"
  ])("does not render customer-facing WhatsApp support links in %s", (path) => {
    expect(source(path)).not.toContain("<WhatsAppSupportLink");
  });

  it("displays prominent POWERED BY APEXNET footer branding", () => {
    expect(footerSource).toContain("POWERED BY");
    expect(footerSource).toContain("APEXNET");
    expect(footerSource).not.toContain("Created by Martinz");
  });
});
