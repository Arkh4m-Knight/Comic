import { createClient } from "@supabase/supabase-js";

// This client uses the powerful service_role key and bypasses Row Level
// Security entirely. It must NEVER be imported into any "use client"
// component or sent to the browser — only use it inside API routes
// (src/app/api/**/route.ts), which run on the server.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
