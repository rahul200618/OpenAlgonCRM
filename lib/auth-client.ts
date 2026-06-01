/**
 * OrvixCRM — Supabase Auth client export
 *
 * This re-exports the Supabase browser client for convenience.
 * Previously this was the Better Auth client (authClient).
 * Components should import the Supabase client directly:
 *   import { createClient } from "@/lib/supabase/client";
 *
 * This file is kept for backward compatibility — it just re-exports createClient.
 */
export { createClient as authClient } from "@/lib/supabase/client";
