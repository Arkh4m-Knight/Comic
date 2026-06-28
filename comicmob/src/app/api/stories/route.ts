import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData.user) {
    return NextResponse.json({ error: "You must be signed in to publish a story." }, { status: 401 });
  }

  const { title, hook, genres, accent } = await req.json();

  if (!title || !hook) {
    return NextResponse.json({ error: "Title and hook are required." }, { status: 400 });
  }

  let slug = slugify(title);
  // Ensure uniqueness by appending a short suffix if needed
  const { data: existing } = await supabase.from("stories").select("slug").eq("slug", slug).maybeSingle();
  if (existing) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const { data, error } = await supabase
    .from("stories")
    .insert({
      slug,
      title,
      hook,
      genres: Array.isArray(genres) ? genres : [],
      accent: accent || "#C9A227",
      is_original: false,
      creator_id: userData.user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ story: data });
}
