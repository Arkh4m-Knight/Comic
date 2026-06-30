import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(req: Request, { params }: { params: { storyId: string } }) {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData.user) {
    return NextResponse.json({ error: "You must be signed in to publish a chapter." }, { status: 401 });
  }

  // Confirm this user actually owns the story they're trying to add to --
  // or, for the 4 Originals (no creator_id), that they're the studio admin.
  const { data: story } = await supabase
    .from("stories")
    .select("id, creator_id, is_original")
    .eq("id", params.storyId)
    .single();

  if (!story) {
    return NextResponse.json({ error: "Story not found." }, { status: 404 });
  }

  const isOwner = story.creator_id === userData.user.id;
  let isAdminForOriginal = false;
  if (!isOwner && story.is_original) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();
    isAdminForOriginal = profile?.role === "Admin";
  }

  if (!isOwner && !isAdminForOriginal) {
    return NextResponse.json({ error: "You can only add chapters to your own stories." }, { status: 403 });
  }

  const { number, title, content } = await req.json();

  if (!number || !title || !content) {
    return NextResponse.json({ error: "Chapter number, title, and content are required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("story_chapters")
    .insert({ story_id: params.storyId, number, title, content })
    .select("id, story_id, number, title, published_at, coin_price, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ chapter: data });
}
