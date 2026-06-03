import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  if (typeof document !== "undefined") {
    document.cookie = "dev_bypass_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  }
}
