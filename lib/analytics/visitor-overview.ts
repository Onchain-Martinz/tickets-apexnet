import "server-only";

import { createSign } from "node:crypto";

type VisitorOverview = {
  anonymousVisitors: number;
  registeredVisitors: number;
  conversionPercentage: number;
};

type AnalyticsReport = {
  rows?: Array<{
    dimensionValues?: Array<{ value?: string }>;
    metricValues?: Array<{ value?: string }>;
  }>;
};

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const ANALYTICS_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const VISITOR_TRACKING_START_DATE = "2026-08-04";

function encode(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function createServiceAccountAssertion(email: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = encode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = encode(
    JSON.stringify({
      iss: email,
      scope: ANALYTICS_SCOPE,
      aud: GOOGLE_TOKEN_URL,
      iat: now,
      exp: now + 3600
    })
  );
  const unsignedToken = `${header}.${payload}`;
  const signature = createSign("RSA-SHA256")
    .update(unsignedToken)
    .sign(privateKey.replace(/\\n/g, "\n"));

  return `${unsignedToken}.${encode(signature)}`;
}

async function getAccessToken(email: string, privateKey: string) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: createServiceAccountAssertion(email, privateKey)
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(6000)
  });

  if (!response.ok) throw new Error("Google Analytics authorization failed.");

  const result = (await response.json()) as { access_token?: string };
  if (!result.access_token) throw new Error("Google Analytics returned no access token.");
  return result.access_token;
}

export async function getVisitorOverview(): Promise<VisitorOverview | null> {
  const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID?.replace(/^properties\//, "");
  const email = process.env.GOOGLE_ANALYTICS_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_ANALYTICS_PRIVATE_KEY;

  if (!propertyId || !email || !privateKey) return null;

  try {
    const accessToken = await getAccessToken(email, privateKey);
    const response = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          dateRanges: [
            {
              startDate:
                process.env.GOOGLE_ANALYTICS_VISITOR_START_DATE ?? VISITOR_TRACKING_START_DATE,
              endDate: "today"
            }
          ],
          dimensions: [{ name: "signedInWithUserId" }],
          metrics: [{ name: "totalUsers" }]
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(6000)
      }
    );

    if (!response.ok) throw new Error("Google Analytics visitor report failed.");

    const report = (await response.json()) as AnalyticsReport;
    let anonymousVisitors = 0;
    let registeredVisitors = 0;

    for (const row of report.rows ?? []) {
      const status = row.dimensionValues?.[0]?.value?.toLowerCase();
      const users = Number(row.metricValues?.[0]?.value ?? 0);
      if (status === "yes") registeredVisitors += users;
      else anonymousVisitors += users;
    }

    const totalVisitors = anonymousVisitors + registeredVisitors;
    const conversionPercentage = totalVisitors
      ? (registeredVisitors / totalVisitors) * 100
      : 0;

    return { anonymousVisitors, registeredVisitors, conversionPercentage };
  } catch {
    return null;
  }
}
