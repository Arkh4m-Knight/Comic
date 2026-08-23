import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

async function checkChapterEditAccess(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  storyId: string
) {
  const { data: story } = await supabase
    .from("stories")
    .select("id, creator_id, is_original")
    .eq("id", storyId)
    .single();

  if (!story) return { allowed: false as const, error: "Story not found.", status: 404 };

  const isOwner = story.creator_id === userId;
  let isAdminForOriginal = false;
  if (!isOwner && story.is_original) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    isAdminForOriginal = profile?.role === "Admin";
  }

  if (!isOwner && !isAdminForOriginal) {
    return { allowed: false as const, error: "You can only edit chapters from your own stories.", status: 403 };
  }

  return { allowed: true as const };
}

export async function GET(req: Request, { params }: { params: { storyId: string; chapterId: string } }) {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData.user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const access = await checkChapterEditAccess(supabase, userData.user.id, params.storyId);
  if (!access.allowed) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const { data, error } = await supabase.rpc("get_chapter_for_edit", { p_chapter_id: params.chapterId });

  if (error || data?.error) {
    return NextResponse.json({ error: "Couldn't load this chapter." }, { status: 400 });
  }

  return NextResponse.json({ chapter: data });
}

export async function PATCH(req: Request, { params }: { params: { storyId: string; chapterId: string } }) {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData.user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const access = await checkChapterEditAccess(supabase, userData.user.id, params.storyId);
  if (!access.allowed) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const { title, content } = await req.json();

  if (!title || !title.trim() || !content || !content.trim()) {
    return NextResponse.json({ error: "Title and content are both required." }, { status: 400 });
  }

  const { error } = await supabase
    .from("story_chapters")
    .update({ title: title.trim(), content: content.trim() })
    .eq("id", params.chapterId)
    .eq("story_id", params.storyId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: { storyId: string; chapterId: string } }
) {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData.user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const access = await checkChapterEditAccess(supabase, userData.user.id, params.storyId);
  if (!access.allowed) {
    return NextResponse.json({ error: access.error }, { status: access.status });
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
