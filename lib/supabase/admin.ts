import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { LocalSupabaseAdminClient } from "./local-store";

class RealtimeDisabledTransport {
  constructor() {
    throw new Error("Realtime is disabled for server-side administrative clients.");
  }
}

function shouldUseLocalStore(url: string) {
  // CRITICAL PRODUCTION SAFETY:
  // In production (NODE_ENV === "production" or running on Vercel), Supabase is strictly mandatory.
  // Never silently switch production persistence to local filesystem storage.
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return false;
  }

  // In local development/testing ONLY:
  if (process.env.USE_LOCAL_DATABASE === "true") return true;
  if (
    url.includes("lraveoncqxtvehxbxvsv") ||
    url.includes("your-project-ref") ||
    url.includes("localhost") ||
    url.includes("127.0.0.1")
  ) {
    return true;
  }

  return false;
}

export function createAdminClient() {
  if (process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY) {
    throw new Error(
      "Supabase secret key must use SUPABASE_SECRET_KEY, not NEXT_PUBLIC_SUPABASE_SECRET_KEY."
    );
  }

  const url = process.env.SUPABASE_URL;
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secretKey) {
    throw new Error("Supabase admin configuration is missing.");
  }

  if (shouldUseLocalStore(url)) {
    return new LocalSupabaseAdminClient() as any;
  }

  return createSupabaseClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    realtime: {
      transport: RealtimeDisabledTransport as never
    }
  });
}
