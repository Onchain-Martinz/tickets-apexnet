import { createClient } from "@supabase/supabase-js";

class RealtimeDisabledTransport {
  constructor() {
    throw new Error("Realtime is disabled for the admin bootstrap script.");
  }
}

const email = process.argv[2] ?? process.env.INITIAL_ADMIN_EMAIL;
const url = process.env.SUPABASE_URL;
const secretKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email || !url || !secretKey) {
  process.stderr.write(
    "Usage: INITIAL_ADMIN_EMAIL=user@example.com npm run admin:bootstrap\n" +
      "SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) are also required.\n"
  );
  process.exitCode = 1;
} else {
  const supabase = createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    realtime: {
      transport: RealtimeDisabledTransport
    }
  });
  const { data, error } = await supabase.rpc("bootstrap_initial_admin", {
    p_email: email.trim().toLowerCase()
  });

  if (error) {
    process.stderr.write(`Admin bootstrap failed: ${error.message}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(`Admin role granted to verified user ${data}.\n`);
  }
}
