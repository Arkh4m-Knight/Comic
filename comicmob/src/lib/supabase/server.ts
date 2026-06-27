import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Creates a Supabase client scoped to a single incoming request, using that
// request's own cookies. This is what replaces the old shared `currentUser`
// variable — every request gets its own session, read from its own cookies,
// so one visitor's login can never leak into another visitor's request.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll is called from a Server Component sometimes, where
            // cookies can't be written. Safe to ignore — middleware below
            // handles refreshing the session in that case.
          }
        },
      },
    }
  );
}
