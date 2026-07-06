import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// SERVICE ROLE client -- bypasses RLS and all column-level grants entirely.
// Only ever use this from trusted server-only code (Razorpay webhook,
// payment verification route). Never import this from a client component,
// and never let SUPABASE_SERVICE_ROLE_KEY leak into anything prefixed
// NEXT_PUBLIC_.
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
