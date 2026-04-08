import { createClient } from '@supabase/supabase-js';

/**
 * Lazy-initialized Supabase Admin client.
 * This avoids build-time errors when env vars aren't available.
 */
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
