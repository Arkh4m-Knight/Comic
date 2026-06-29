import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

function errorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error && typeof (error as any).message === "string" && (error as any).message.length > 0) {
    return (error as any).message;
  }
  return fallback;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, username, password, action } = body ?? {};
    const supabase = await createClient();

    if (action === "signup") {
      if (!email || !username || !password) {
        return NextResponse.json(
          { error: "Email, username, and password are required" },
          { status: 400 }
        );
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, display_name: username },
        },
      });

      if (error) {
        // Log the full error server-side (visible in Vercel's function logs)
        // so we can diagnose Supabase-side failures -- rate limits, etc --
        // without guessing from the client's generic error text.
        console.error("Signup error:", JSON.stringify(error));
        return NextResponse.json(
          { error: errorMessage(error, "Signup failed. Please try again in a moment.") },
          { status: 400 }
        );
      }

      return NextResponse.json({
        user: data.user ? { id: data.user.id, email: data.user.email, username } : null,
        // Supabase emails a confirmation link by default. If "Confirm email" is
        // turned on in Supabase Auth settings, the user must click that link
        // before they can sign in.
        needsEmailConfirmation: !data.session,
      });
    }

    if (action === "signin") {
      if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error("Signin error:", JSON.stringify(error));
        return NextResponse.json({ error: errorMessage(error, "Invalid credentials") }, { status: 401 });
      }

      return NextResponse.json({
        user: { id: data.user.id, email: data.user.email },
      });
    }

    if (action === "signout") {
      await supabase.auth.signOut();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Unexpected /api/auth error:", err);
    return NextResponse.json(
      { error: "Something went wrong on our end. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, role")
    .eq("id", data.user.id)
    .single();

  return NextResponse.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      username: profile?.username,
      displayName: profile?.display_name,
      role: profile?.role,
    },
  });
}
