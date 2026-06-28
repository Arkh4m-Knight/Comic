import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(req: Request, { params }: { params: { storyId: string } }) {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData.user) {
    return NextResponse.json({ error: "You must be signed in to publish a chapter." }, { status: 401 });
  }

  // Confirm this user actually owns the story they're trying to add to.
  const { data: story } = await supabase
    .from("stories")
    .select("id, creator_id")
    .eq("id", params.storyId)
    .single();

  if (!story || story.creator_id !== userData.user.id) {
    return NextResponse.json({ error: "You can only add chapters to your own stories." }, { status: 403 });
  }

  const { number, title, content } = await req.json();

  if (!number || !title || !content) {
    return NextResponse.json({ error: "Chapter number, title, and content are required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("story_chapters")
    .insert({ story_id: params.storyId, number, title, content })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ chapter: data });
}
