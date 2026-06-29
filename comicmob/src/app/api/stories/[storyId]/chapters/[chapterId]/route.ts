import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function DELETE(
  req: Request,
  { params }: { params: { storyId: string; chapterId: string } }
) {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData.user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const { data: story } = await supabase
    .from("stories")
    .select("id, creator_id")
    .eq("id", params.storyId)
    .single();

  if (!story || story.creator_id !== userData.user.id) {
    return NextResponse.json({ error: "You can only delete chapters from your own stories." }, { status: 403 });
  }

  const { error } = await supabase
    .from("story_chapters")
    .delete()
    .eq("id", params.chapterId)
    .eq("story_id", params.storyId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
