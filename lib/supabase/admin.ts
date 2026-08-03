import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

class RealtimeDisabledTransport {
  constructor() {
    throw new Error("Realtime is disabled for server-side administrative clients.");
  }
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
