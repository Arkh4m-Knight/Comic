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

export async function PATCH(req: Request, { params }: { params: { storyId: string } }) {
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
    return NextResponse.json({ error: "You can only edit your own stories." }, { status: 403 });
  }

  const { cover_url, free_chapter_count, unlock_wait_days } = await req.json();

  const updates: Record<string, unknown> = {};

  if (cover_url !== undefined) {
    if (!cover_url) {
      return NextResponse.json({ error: "cover_url cannot be empty." }, { status: 400 });
    }
    updates.cover_url = cover_url;
  }

  if (free_chapter_count !== undefined) {
    const n = Number(free_chapter_count);
    if (!Number.isInteger(n) || n < 0) {
      return NextResponse.json({ error: "free_chapter_count must be a non-negative whole number." }, { status: 400 });
    }
    updates.free_chapter_count = n;
  }

  if (unlock_wait_days !== undefined) {
    const n = Number(unlock_wait_days);
    if (!Number.isInteger(n) || n < 1) {
      return NextResponse.json({ error: "unlock_wait_days must be a whole number of at least 1." }, { status: 400 });
    }
    updates.unlock_wait_days = n;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { error } = await supabase.from("stories").update(updates).eq("id", params.storyId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
