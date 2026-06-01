import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase admin client using the service_role key.
 * NEVER expose this on the client side — server-only.
 * Use for: user management, bypassing RLS, admin operations.
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
