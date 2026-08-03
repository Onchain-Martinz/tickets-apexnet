export function getAppUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configured && process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_APP_URL is required in production.");
  }

  const candidate = configured || "http://localhost:3000";
  const url = new URL(candidate);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_APP_URL must use http or https.");
  }

  if (
    process.env.NODE_ENV === "production" &&
    (url.protocol !== "https:" || isLoopbackHost(url.hostname))
  ) {
    throw new Error("NEXT_PUBLIC_APP_URL must be a public HTTPS origin in production.");
  }

  return url.origin;
}

function isLoopbackHost(hostname: string) {
  return ["localhost", "127.0.0.1", "[::1]", "::1"].includes(hostname);
}
