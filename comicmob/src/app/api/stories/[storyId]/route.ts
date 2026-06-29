import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function DELETE(req: Request, { params }: { params: { storyId: string } }) {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData.user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const { data: story } = await supabase
    .from("stories")
    .select("id, creator_id, is_original")
    .eq("id", params.storyId)
    .single();

  if (!story) {
    return NextResponse.json({ error: "Story not found." }, { status: 404 });
  }

  if (story.is_original) {
    return NextResponse.json({ error: "Originals can't be deleted here." }, { status: 403 });
  }

  if (story.creator_id !== userData.user.id) {
    return NextResponse.json({ error: "You can only delete your own stories." }, { status: 403 });
  }

  // Chapters cascade-delete automatically (story_chapters.story_id has
  // "on delete cascade" in the schema), so deleting the story is enough.
  const { error } = await supabase.from("stories").delete().eq("id", params.storyId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
